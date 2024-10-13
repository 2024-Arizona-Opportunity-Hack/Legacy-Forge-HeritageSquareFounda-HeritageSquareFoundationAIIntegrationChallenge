from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from langchain_community.chat_models import ChatOllama
import requests
from io import BytesIO

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
        outputs = self.blip_model.generate(**inputs, max_new_tokens=20)  # Adjust '50' based on your needs
        
        # Decode the output to get the description
        description = self.blip_processor.decode(outputs[0], skip_special_tokens=True)
        
        return description


    def query_ollama_with_title_and_description(self, title, description):
        # Combine the title and description into a prompt
        combined_prompt = f"Title: '{title}'\nDescription: {description}\nCan you refine or elaborate further on what this image represents?"

        # Query the Ollama model
        response = self.llama_model.invoke(combined_prompt)
        
        return response

# PART 2: Processing Multiple Images with User Input

def process_multiple_images(llama_project, image_urls):
    for url in image_urls:
        try:
            # Download the image and its title
            image, title = llama_project.download_image_and_title_from_google_drive(url)
            
            # Generate metadata description for the image
            metadata_description = llama_project.generate_metadata_description(image)
            
            # Combine the title and description and query Ollama for a refined description
            refined_description = llama_project.query_ollama_with_title_and_description(title, metadata_description)
            
            # Output the results
            print(f"\nFile Title: {title}")
            print(f"Generated Metadata Description: {metadata_description}")
        
        except Exception as e:
            print(f"Error processing image from URL {url}: {str(e)}")

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
