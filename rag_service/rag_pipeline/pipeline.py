import os

from ingestion.document_processor import process_document
from retrieval.vector_store import create_vector_store, delete_vector_store,get_all_documents
from retrieval.retriever import retrieve_documents, format_retrieved_documents
from generation.generator import generate_answer, astream_answer_from_llm
from generation.note_generator import generate_notes
from config import DEFAULT_K, UPLOAD_DIR


def _validate_upload_path(path: str) -> None:
    """
    Stops an attacker-controlled file_path from reading arbitrary files off
    disk (e.g. "../../etc/passwd") by requiring uploads to live in UPLOAD_DIR.
    """
    upload_root = os.path.abspath(UPLOAD_DIR)
    target = os.path.abspath(path)
    if os.path.commonpath([upload_root, target]) != upload_root:
        raise ValueError("file source must be located inside the uploads directory.")
    if not os.path.isfile(target):
        raise ValueError(f"File not found: {path}")


def index_document(source: str, document_id: str, source_type: str = "file"):
    if source_type == "file":
        _validate_upload_path(source)

    chunks = process_document(source=source, document_id=document_id, source_type=source_type)
    create_vector_store(chunks=chunks, document_id=document_id)

    return {
        "document_id": document_id,
        "source_type": source_type,
        "chunks_created": len(chunks),
        "status": "indexed",
    }


def remove_document(document_id: str):
    delete_vector_store(document_id)
    return {"document_id": document_id, "status": "deleted"}


def ask_question(question: str, document_id: str, k: int = DEFAULT_K, chat_history=None):
    results = retrieve_documents(question=question, document_id=document_id, k=k)

    if not results:
        return {
            "answer": "The information is not available in the provided sources.",
            "sources": [],
        }

    context = format_retrieved_documents(results)
    answer = generate_answer(question=question, context=context, chat_history=chat_history)

    sources = [
        {"content": doc.page_content, "metadata": doc.metadata, "score": float(score)}
        for doc, score in results
    ]
    return {"answer": answer, "sources": sources}

def generate_video_notes(
    document_id: str,
    detail_level: str = "detailed",
    explanation_level: str = "intermediate",
    note_structure: str = "structured",
    include: dict | None = None,
    faithful_to_video: bool = True,
):
    """
    Generate notes from the entire indexed document.

    Unlike question answering, note generation should not depend on
    semantic top-k retrieval because that can miss important sections
    of a long video.
    """

    documents = get_all_documents(document_id)

    if not documents:
        raise ValueError(
            "No indexed content was found for this document."
        )

    # Sort chunks according to their original position when available.
    documents.sort(
        key=lambda document: (
            document.metadata.get("chunk_id", 0)
            if isinstance(document.metadata.get("chunk_id", 0), int)
            else 0
        )
    )

    # Build complete source context.
    context_parts = []

    for index, document in enumerate(documents, start=1):
        metadata = document.metadata or {}

        timestamp = (
            metadata.get("timestamp")
            or metadata.get("start_time")
            or metadata.get("start")
        )

        timestamp_text = (
            f" [Timestamp: {timestamp}]"
            if timestamp is not None
            else ""
        )

        context_parts.append(
            f"[VIDEO CHUNK {index}]{timestamp_text}\n"
            f"{document.page_content}"
        )

    context = "\n\n---\n\n".join(context_parts)

    notes = generate_notes(
        context=context,
        detail_level=detail_level,
        explanation_level=explanation_level,
        note_structure=note_structure,
        include=include,
        faithful_to_video=faithful_to_video,
    )

    return {
        "document_id": document_id,
        "notes": notes,
        "chunks_processed": len(documents),
    }


async def astream_answer(question: str, document_id: str, k: int = DEFAULT_K, chat_history=None):
    try:
        results = retrieve_documents(question=question, document_id=document_id, k=k)
    except (FileNotFoundError, ValueError) as error:
        yield {"type": "error", "message": str(error)}
        yield {"type": "done"}
        return

    if not results:
        yield {"type": "token", "content": "The information is not available in the provided sources."}
        yield {"type": "sources", "sources": []}
        yield {"type": "done"}
        return

    context = format_retrieved_documents(results)

    async for token in astream_answer_from_llm(question=question, context=context, chat_history=chat_history):
        yield {"type": "token", "content": token}

    sources = [
        {"content": doc.page_content, "metadata": doc.metadata, "score": float(score)}
        for doc, score in results
    ]
    yield {"type": "sources", "sources": sources}
    yield {"type": "done"}