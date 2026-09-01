import os
import re

from loaders.loader import load_document
from ingestion.chunker import split_documents


def _extract_first_timestamp(text: str):
    """
    Extract the first [MM:SS] or [HH:MM:SS] timestamp
    from a video chunk.
    """

    match = re.search(
        r"\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]",
        text,
    )

    if not match:
        return None

    first = int(match.group(1))
    second = int(match.group(2))
    third = match.group(3)

    if third is not None:
        return first * 3600 + second * 60 + int(third)

    return first * 60 + second


def process_document(
    source: str,
    document_id: str,
    source_type: str = "file",
):
    """
    source_type: "file" | "web" | "video"

    `source` is a local file path for "file",
    a URL for "web" and "video".
    """

    documents = load_document(
        source,
        source_type=source_type,
    )

    for document in documents:
        document.metadata["document_id"] = document_id

        document.metadata.setdefault(
            "source",
            source,
        )

        if source_type == "file":
            document.metadata["file_name"] = os.path.basename(source)

    chunks = split_documents(documents)

    if not chunks:
        raise ValueError(
            "No content could be extracted from the source."
        )

    for index, chunk in enumerate(chunks):
        chunk.metadata["chunk_id"] = index

        # Preserve the beginning timestamp of video chunks.
        if source_type == "video":
            timestamp = _extract_first_timestamp(
                chunk.page_content
            )

            if timestamp is not None:
                chunk.metadata["start_time"] = timestamp

    return chunks