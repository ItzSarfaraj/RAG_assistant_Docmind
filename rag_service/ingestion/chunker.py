from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import CHUNK_SIZE, CHUNK_OVERLAP


def split_documents(documents):
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        length_function=len,
        # Sentence-level separator added so chunks break on sentence
        # boundaries before falling back to raw character splits.
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    return splitter.split_documents(documents)