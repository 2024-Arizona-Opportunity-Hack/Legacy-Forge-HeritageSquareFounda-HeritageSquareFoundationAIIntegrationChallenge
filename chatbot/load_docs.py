from langchain_community.document_loaders import WebBaseLoader
from langchain_community.chat_models import ChatOllama
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from vector_db import load_vector_db
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
import requests
import pandas as pd
# Initialize the model
# 1. Split data into chunks


def extract_text_from_google_doc(doc_url):
    # Extract the document ID from the URL
    doc_id = doc_url.split('/d/')[1].split('/')[0]
    export_url = f"https://docs.google.com/document/d/{doc_id}/export?format=txt"
    
    # Fetch the document content
    response = requests.get(export_url)
    response.raise_for_status()
    
    # Extract the title and content
    content = response.text
    title = content.split('\n')[0]  # Assuming the first line is the title
    return title, content

def write_document(doc_urls):
    doc_data = []
    for url in doc_urls:
        try:
            title, content = extract_text_from_google_doc(url)
            doc_data.append([title, content])
        except Exception as e:
            print(f"Error processing document from URL {url}: {str(e)}")
    
    # Write document data to CSV
    df = pd.DataFrame(doc_data, columns=['Title', 'Content'])
    df.to_csv('data_read.csv', index=False)
    print("Documents written to data_read.csv successfully.")


if __name__ == "__main__":
    doc_urls = []
    print("Enter the Google Doc URLs you want to process. Type 'done' when finished:")
    while True:
        url = input("Enter Google Doc URL: ")
        if url.lower() == 'done':
            break
        elif url.startswith("https://docs.google.com/document/"):
            doc_urls.append(url)
        else:
            print("Please enter a valid Google Doc URL.")
    
    # Write document data to CSV
    write_document(doc_urls)