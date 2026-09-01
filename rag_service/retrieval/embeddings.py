from functools import lru_cache

from langchain_google_genai import GoogleGenerativeAIEmbeddings

from config import EMBEDDING_MODEL


@lru_cache(maxsize=1)
def get_embedding_model():
    """
    Cached so we don't reconstruct the client (and its connection pool)
    on every single index/query call.
    """
    return GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)