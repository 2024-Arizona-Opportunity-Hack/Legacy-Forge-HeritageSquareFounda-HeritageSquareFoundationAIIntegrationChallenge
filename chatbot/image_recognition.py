from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from langchain_ollama import ChatOllama, OllamaEmbeddings  # Updated import statement
import requests
from io import BytesIO
from langchain.text_splitter import CharacterTextSplitter   
from langchain_community.vectorstores import Chroma
from langchain.schema import Document   
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

# PART 1: Initialization of Models (Llama and BLIP)

class LlamaProject:
    def __init__(self):
        # Initialize the Ollama model (Llama 3.2 1b)
        self.llama_model = ChatOllama(model="llama3.2:1b", temperature=0.2)  # Lower temperature for deterministic output
        
        # Initialize the BLIP model for generating image descriptions
        self.blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
        self.blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

    def download_image_and_title_from_google_drive(self, drive_url):
        # Modify the Google Drive URL to get the direct download link
        file_id = drive_url.split("/d/")[1].split("/")[0]
        download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
        
        # Download the image using the direct download link
        response = requests.get(download_url)
        
        # Extract file title from headers (content-disposition)
        file_title = "Untitled"  # Default if no title is available
        if 'content-disposition' in response.headers:
            content_disposition = response.headers['content-disposition']
            if 'filename=' in content_disposition:
                file_title = content_disposition.split("filename=")[1].strip('"')
        
        # Check if the response content is valid
        if response.status_code == 200 and 'image' in response.headers.get('content-type', ''):
            img = Image.open(BytesIO(response.content))
            return img, file_title
        else:
            raise ValueError("Failed to download a valid image from the provided URL")

    def generate_metadata_description(self, image):
        # Preprocess the image for BLIP
        inputs = self.blip_processor(images=image, return_tensors="pt")
        
        # Generate the description using the BLIP model with max_new_tokens
        outputs = self.blip_model.generate(**inputs, max_new_tokens=50)  # Adjust '50' based on your needs
        
        # Decode the output to get the description
        description = self.blip_processor.decode(outputs[0], skip_special_tokens=True)
        
        return description

    def query_ollama_with_title_and_description(self, title, description):
        # Combine the title and description into a prompt
        combined_prompt = f"Title: '{title}'\nDescription: {description}\nCan you refine or elaborate further on what this image represents?"

        # Query the Ollama model
        response = self.llama_model.invoke(combined_prompt)
        
        return response

    def vectorize_and_store_metadata(self, title, description):
        # Combine the title and description into a single string
        combined_string = f"Title: {title}\nDescription: {description}"
        
        # Split the string into chunks (if needed) to handle large text
        text_splitter = CharacterTextSplitter(chunk_size=7500, chunk_overlap=100)
        chunks = text_splitter.split_text(combined_string)
        documents = [Document(page_content=chunk) for chunk in chunks]

        vectorstore = Chroma.from_documents(
            documents=documents,
            collection_name="rag-chroma",
            embedding=OllamaEmbeddings(model='nomic-embed-text'),
        )
        retriever = vectorstore.as_retriever()
        embeddings_data = vectorstore._collection.get(include=["embeddings"])
        return embeddings_data["embeddings"]

    def query_image_by_string(self, query_string):
        # Step 1: Vectorize the query string
        query_embedding = OllamaEmbeddings(model='nomic-embed-text').embed_query(query_string)
        return query_embedding
    
    def find_closest_embedding(self, query_embedding, all_embeddings):
        # Step 2: Calculate cosine similarity between the query and all stored embeddings
        similarities = []
        for embedding in all_embeddings:
            # Cosine similarity between query and current embedding
            similarity = cosine_similarity([query_embedding], [embedding])
            similarities.append(similarity[0][0])  # similarity is a 2D array, we take the first element
        
        # Step 3: Find the index of the most similar embedding
        closest_idx = np.argmax(similarities)  # Index of the highest similarity
        return closest_idx, similarities[closest_idx]

    def write_to_file(self, filename, text):
        with open(filename, 'w') as file:  # 'w' mode will overwrite the file if it already exists
            file.write(text)

# PART 2: Processing Multiple Images with User Input

def process_multiple_images(llama_project, image_urls):
    all_embeddings = []
    for url in image_urls:
        try:
            # Download the image and its title
            image, title = llama_project.download_image_and_title_from_google_drive(url)
            
            # Generate metadata description for the image
            metadata_description = llama_project.generate_metadata_description(image)
            
            # Combine the title and description and query Ollama for a refined description
            refined_description = llama_project.query_ollama_with_title_and_description(title, metadata_description)
            
            # Append the title and description to the CSV file
            append_to_csv('data_read.csv', title, metadata_description)
            
            x = (f"Title: {title}\nDescription: {metadata_description}")
            llama_project.write_to_file('../imageinfo.txt', x)
        
        except Exception as e:
            print(f"Error processing image from URL {url}: {str(e)}")

def append_to_csv(filename, title, description):
    # Read the existing CSV file
    try:
        df = pd.read_csv(filename)
    except FileNotFoundError:
        df = pd.DataFrame(columns=['Title', 'Content'])
    
    # Append the new data
    new_data = pd.DataFrame([[title, description]], columns=['Title', 'Content'])
    df = pd.concat([df, new_data], ignore_index=True)
    
    # Drop rows with NaN values
    df.dropna(subset=['Content'], inplace=True)
    
    # Write the updated DataFrame back to the CSV file
    df.to_csv(filename, index=False)
    print(f"Appended data to {filename} successfully.")

# Get User Input for Multiple Google Drive URLs
def get_user_input_for_urls():
    urls = []
    print("Enter the Google Drive URLs of the images you want to process. Type 'done' when finished:")
    
    while True:
        url = input("Enter Google Drive URL: ")
        if url.lower() == 'done':
            break
        elif url.startswith("https://drive.google.com/"):
            urls.append(url)
        else:
            print("Please enter a valid Google Drive URL.")
    
    return urls

# Example Usage
if __name__ == "__main__":
    # Initialize the Llama project (models are initialized once)
    llama_project = LlamaProject()
    
    # Get the list of Google Drive URLs as input from the user
    google_drive_urls = get_user_input_for_urls()
    
    if google_drive_urls:
        # Process multiple images
        process_multiple_images(llama_project, google_drive_urls)
    else:
        print("No URLs provided. Exiting.")