import json
from PIL import Image
import piexif
from transformers import BlipProcessor, BlipForConditionalGeneration
from langchain_community.chat_models import ChatOllama
from langchain_community.vectorstores import Chroma
from langchain.embeddings import HuggingFaceEmbeddings
from io import BytesIO
import requests
from googleapiclient.discovery import build
import os

# Initialize the Ollama model (Llama 3.2 1b) with temperature setting
llama_model = ChatOllama(model="llama3.2:1b", temperature=0.5)

# Initialize the BLIP model to generate a description (caption) of the image
blip_processor = BlipProcessor.from_pretrained("Salesforce/blip-image-captioning-base")
blip_model = BlipForConditionalGeneration.from_pretrained("Salesforce/blip-image-captioning-base")

# Function to download the image and its title from Google Drive
def download_image_and_title_from_google_drive(drive_url):
    file_id = drive_url.split("/d/")[1].split("/")[0]
    download_url = f"https://drive.google.com/uc?export=download&id={file_id}"
    response = requests.get(download_url)

    # Extract file title from headers (content-disposition)
    file_title = "Untitled"
    if 'content-disposition' in response.headers:
        content_disposition = response.headers['content-disposition']
        if 'filename=' in content_disposition:
            file_title = content_disposition.split("filename=")[1].strip('"')

    img = Image.open(BytesIO(response.content))
    return img, file_title

# Function to extract metadata from an image
def extract_image_metadata(image):
    exif_data = piexif.load(image.info['exif']) if 'exif' in image.info else None
    if exif_data:
        metadata = {
            'resolution': f"{image.size[0]}x{image.size[1]}",
            'camera_make': exif_data['0th'].get(piexif.ImageIFD.Make, 'Unknown'),
            'camera_model': exif_data['0th'].get(piexif.ImageIFD.Model, 'Unknown'),
        }
    else:
        metadata = {
            'resolution': f"{image.size[0]}x{image.size[1]}",
            'camera_make': 'Unknown',
            'camera_model': 'Unknown',
        }
    return metadata

# Function to generate description from BLIP model
def generate_image_description(image):
    inputs = blip_processor(image, return_tensors="pt")
    out = blip_model.generate(**inputs)
    description = blip_processor.decode(out[0], skip_special_tokens=True)
    return description

# Function to store image metadata and description in a vector database
from langchain.docstore.document import Document  # Import the Document class

# Function to store image metadata and description in a vector database
def store_image_in_vector_db(image_metadata, description, file_title):
    # Convert metadata to a JSON string
    metadata_str = json.dumps(image_metadata)
    
    # Create Document objects for the vector store
    docs = [
        Document(page_content=description, metadata={"metadata": metadata_str, "title": file_title})
    ]
    
    # Use HuggingFace Embeddings instead of OpenAI API
    embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Create a vectorstore using Chroma
    vectorstore = Chroma.from_documents(
        documents=docs,
        collection_name="image-metadata",
        embedding=embedding_model
    )
    
    return vectorstore


# Function to query Ollama model using the vector DB and metadata
def interact_with_ollama_about_image(retriever, question):
    # Retrieve context (metadata and description) for the question
    retrieved_context = retriever.get_relevant_documents(question)
    
    # Create a conversational prompt
    prompt = f"""
    I have an image with the following details:
    {retrieved_context}

    Now, based on this, {question}
    """
    
    # Pass the prompt to Ollama with temperature set to 0.5 for creativity
    response = llama_model.invoke(prompt)
    
    return response

# Example usage with a Google Drive URL
google_drive_url = "https://drive.google.com/file/d/1E1bZssv3tepvf_VfGae5n-LtyTEdLefG/view?usp=drive_link"
image, file_title = download_image_and_title_from_google_drive(google_drive_url)

# Extract metadata and description
metadata = extract_image_metadata(image)
description = generate_image_description(image)

# Store in vector DB
vectorstore = store_image_in_vector_db(metadata, description, file_title)
retriever = vectorstore.as_retriever()

# Start querying loop
while True:
    question = input("Ask about the image (type 'q' to quit): ")

    if question.lower() == 'q':
        print("Exiting the query loop.")
        break
    
    response = interact_with_ollama_about_image(retriever, question)
    print(f"Ollama response: {response}")
