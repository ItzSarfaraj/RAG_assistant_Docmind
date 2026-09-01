import os

from loaders.loader import load_document
from ingestion.chunker import split_documents


def process_document(source: str, document_id: str, source_type: str = "file"):
    """
    source_type: "file" | "web" | "video"
    `source` is a local file path for "file", a URL for "web" and "video".
    """
    documents = load_document(source, source_type=source_type)

    for document in documents:
        document.metadata["document_id"] = document_id
        document.metadata.setdefault("source", source)
        if source_type == "file":
            document.metadata["file_name"] = os.path.basename(source)

    chunks = split_documents(documents)

    if not chunks:
        raise ValueError("No content could be extracted from the source.")

    for index, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = index

    return chunks