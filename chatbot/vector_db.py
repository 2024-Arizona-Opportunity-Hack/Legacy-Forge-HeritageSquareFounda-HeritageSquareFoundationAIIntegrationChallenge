from langchain.text_splitter import CharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings
from langchain.docstore.document import Document

def load_vector_db(docs_list):
    # Initialize the text splitter
    text_splitter = CharacterTextSplitter(chunk_size=512, chunk_overlap=0.1)

    # Split the documents into smaller chunks
    doc_splits = text_splitter.split_documents(docs_list)

    # Convert documents to Embeddings and store them
    vectorstore = Chroma.from_documents(
        documents=doc_splits,
        collection_name="rag-chroma",
        embedding=OllamaEmbeddings(model='nomic-embed-text'),
    )

    # Create a retriever from the vector store
    retriever = vectorstore.as_retriever()
    return retriever