from langchain_ollama import ChatOllama  # Updated import statement
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from vector_db import load_vector_db
import requests
import pandas as pd
from langchain.schema import Document
import warnings


warnings.filterwarnings("ignore", category=DeprecationWarning, module="langchain")


def initialize_model():
    model_local = ChatOllama(model="llama3.2:1b")
    return model_local

def read_text():
    df = pd.read_csv('data_read.csv')
    df.dropna(subset=['Content'], inplace=True)  # Drop rows where 'Content' is NaN
    documents = [Document(page_content=row['Content'], metadata={"title": row['Title']}) for _, row in df.iterrows()]
    retriever = load_vector_db(documents)
    return retriever

# 4. call rag
def call_rag(model):
    retriever = read_text()

    after_rag_template = """Answer the question based only on the following context:
    {context}
    Question: {question}
    """
    retriever = read_text()

    after_rag_prompt = ChatPromptTemplate.from_template(after_rag_template)
    after_rag_chain = (
        {"context": retriever, "question": RunnablePassthrough()}
        | after_rag_prompt
        | model
        | StrOutputParser()
    )
    return after_rag_chain

def give_response(query):
    model = initialize_model()
    output = call_rag(model).invoke(query)
    return output

