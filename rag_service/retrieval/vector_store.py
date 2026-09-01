import os
import shutil
import threading

from langchain_community.vectorstores import FAISS

from retrieval.embeddings import get_embedding_model
from config import VECTOR_STORE_DIR, logger

# Loading a FAISS index from disk + re-embedding on every request is one of
# the biggest avoidable latency hits in a small RAG service. Keep loaded
# stores in memory, keyed by document_id.
_cache: dict[str, FAISS] = {}
_cache_lock = threading.Lock()


def _store_path(document_id: str) -> str:
    # Prevent a crafted document_id from writing/reading outside VECTOR_STORE_DIR.
    safe_id = "".join(c for c in document_id if c.isalnum() or c in ("-", "_"))
    if not safe_id:
        raise ValueError("document_id must contain at least one alphanumeric character.")
    return os.path.join(VECTOR_STORE_DIR, safe_id)


def create_vector_store(chunks, document_id: str) -> FAISS:
    if not chunks:
        raise ValueError("No document chunks were provided.")

    embeddings = get_embedding_model()
    vector_store = FAISS.from_documents(chunks, embeddings)

    store_path = _store_path(document_id)
    os.makedirs(store_path, exist_ok=True)
    vector_store.save_local(store_path)

    with _cache_lock:
        _cache[document_id] = vector_store

    logger.info("Indexed document_id=%s chunks=%d", document_id, len(chunks))
    return vector_store


def load_vector_store(document_id: str) -> FAISS:
    with _cache_lock:
        cached = _cache.get(document_id)
    if cached is not None:
        return cached

    store_path = _store_path(document_id)
    if not os.path.exists(store_path):
        raise FileNotFoundError(f"Vector store not found for document: {document_id}")

    embeddings = get_embedding_model()
    vector_store = FAISS.load_local(
        store_path,
        embeddings,
        allow_dangerous_deserialization=True,
    )

    with _cache_lock:
        _cache[document_id] = vector_store

    return vector_store


def delete_vector_store(document_id: str) -> None:
    with _cache_lock:
        _cache.pop(document_id, None)

    store_path = _store_path(document_id)
    if os.path.exists(store_path):
        shutil.rmtree(store_path)
        logger.info("Deleted vector store for document_id=%s", document_id)