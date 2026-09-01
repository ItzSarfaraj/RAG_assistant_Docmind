from urllib.parse import urlparse

from langchain_community.document_loaders import WebBaseLoader


def load_web(url: str):
    url = url.strip()

    if not url:
        raise ValueError("Web URL cannot be empty.")

    parsed = urlparse(url)

    if parsed.scheme not in ("http", "https"):
        raise ValueError("Only http/https URLs are supported for web sources.")

    if not parsed.netloc:
        raise ValueError("Invalid web URL.")

    try:
        loader = WebBaseLoader(url)
        documents = loader.load()
    except Exception as error:
        raise ValueError(
            f"Failed to load webpage: {error}"
        ) from error

    if not documents:
        raise ValueError(
            f"Could not extract any content from: {url}"
        )

    for document in documents:
        document.metadata["source"] = url
        document.metadata["source_type"] = "web"

    return documents