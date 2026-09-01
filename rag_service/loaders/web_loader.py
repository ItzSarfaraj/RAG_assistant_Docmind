from urllib.parse import urlparse

from langchain_community.document_loaders import WebBaseLoader


def load_web(url: str):
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http/https URLs are supported for web sources.")

    loader = WebBaseLoader(url)
    documents = loader.load()

    if not documents:
        raise ValueError(f"Could not extract any content from: {url}")

    for document in documents:
        document.metadata["source"] = url

    return documents