import asyncio
import os

from ingestion.document_processor import process_document
from retrieval.vector_store import create_vector_store, delete_vector_store, get_all_documents
from retrieval.retriever import retrieve_documents, format_retrieved_documents
from generation.generator import generate_answer, astream_answer_from_llm
from generation.note_generator import generate_notes
from config import DEFAULT_K, UPLOAD_DIR


def _validate_upload_path(path: str) -> str:
    upload_root = os.path.abspath(UPLOAD_DIR)
    target = os.path.abspath(
        os.path.join(upload_root, os.path.basename(path))
    )

    if os.path.commonpath([upload_root, target]) != upload_root:
        raise ValueError(
            "file source must be located inside the uploads directory."
        )

    if not os.path.isfile(target):
        raise ValueError(f"File not found: {target}")

    return target


def index_document(source: str, document_id: str, source_type: str = "file"):
    if source_type == "file":
        source = _validate_upload_path(source)

    chunks = process_document(
        source=source,
        document_id=document_id,
        source_type=source_type,
    )

    create_vector_store(
        chunks=chunks,
        document_id=document_id,
    )

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


def _build_notes_context(document_ids: list[str]):
    all_documents = []

    for document_id in document_ids:
        documents = get_all_documents(document_id)
        if not documents:
            continue
        documents.sort(
            key=lambda d: d.metadata.get("chunk_id", 0) if isinstance(d.metadata.get("chunk_id", 0), int) else 0
        )
        all_documents.append((document_id, documents))

    if not all_documents:
        raise ValueError("No indexed content was found for the selected sources.")

    context_parts = []
    total_chunks = 0

    for document_id, documents in all_documents:
        for index, document in enumerate(documents, start=1):
            metadata = document.metadata or {}
            timestamp = metadata.get("timestamp") or metadata.get("start_time") or metadata.get("start")
            timestamp_text = f" [Timestamp: {timestamp}]" if timestamp is not None else ""
            context_parts.append(
                f"[SOURCE {document_id} — CHUNK {index}]{timestamp_text}\n{document.page_content}"
            )
            total_chunks += 1

    return "\n\n---\n\n".join(context_parts), total_chunks


async def generate_video_notes(document_ids: list[str], detail_level="detailed", explanation_level="intermediate", note_structure="structured", include=None, faithful_to_video=True):
    context, chunk_count = _build_notes_context(document_ids)
    notes = await generate_notes(context=context, detail_level=detail_level, explanation_level=explanation_level, note_structure=note_structure, include=include, faithful_to_video=faithful_to_video)
    return {"document_ids": document_ids, "notes": notes, "chunks_processed": chunk_count}


async def astream_video_notes(
    document_id: str,
    detail_level: str = "detailed",
    explanation_level: str = "intermediate",
    note_structure: str = "structured",
    include: dict | None = None,
    faithful_to_video: bool = True,
):
    """
    Same pipeline as generate_video_notes, but yields progress events
    as batches/merges complete so the client can render real progress
    instead of waiting on one long request.
    """
    try:
        context, chunk_count = _build_notes_context(document_id)
    except (FileNotFoundError, ValueError) as error:
        yield {"type": "error", "message": str(error)}
        yield {"type": "done"}
        return

    queue: asyncio.Queue = asyncio.Queue()

    async def on_progress(info: dict):
        queue.put_nowait({"type": "progress", **info})

    async def run():
        try:
            notes = await generate_notes(
                context=context,
                detail_level=detail_level,
                explanation_level=explanation_level,
                note_structure=note_structure,
                include=include,
                faithful_to_video=faithful_to_video,
                on_progress=on_progress,
            )
            queue.put_nowait({
                "type": "notes",
                "document_id": document_id,
                "notes": notes,
                "chunks_processed": chunk_count,
            })
        except Exception as error:
            queue.put_nowait({"type": "error", "message": str(error)})
        finally:
            queue.put_nowait({"type": "done"})

    task = asyncio.create_task(run())

    while True:
        event = await queue.get()
        yield event
        if event["type"] == "done":
            break

    await task