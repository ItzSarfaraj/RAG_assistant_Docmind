from retrieval.vector_store import load_vector_store
from config import RETRIEVAL_SCORE_THRESHOLD, DEFAULT_K, logger


def retrieve_documents(question: str, document_id: str, k: int = DEFAULT_K):
    """
    Returns a list of (Document, score) tuples, filtered to reasonably
    relevant chunks so a barely-related match doesn't get treated as context.
    """
    if not question.strip():
        raise ValueError("Question cannot be empty.")

    vector_store = load_vector_store(document_id)
    results = vector_store.similarity_search_with_score(question, k=k)

    filtered = [(doc, score) for doc, score in results if score <= RETRIEVAL_SCORE_THRESHOLD]

    if not filtered and results:
        # Nothing cleared the bar - still surface the single best match rather
        # than silently returning nothing, but log it so it's easy to notice
        # if the threshold needs recalibrating for your embedding model.
        logger.info("All %d retrieved chunks were below threshold for document_id=%s", len(results), document_id)
        filtered = results[:1]

    return filtered


def format_retrieved_documents(results) -> str:
    """
    Numbers sources so the LLM can cite them as [Source N] and the frontend
    can map a citation straight back to a source card.
    """
    context_parts = []
    for index, (document, score) in enumerate(results, start=1):
        label = (
            document.metadata.get("file_name")
            or document.metadata.get("source")
            or f"chunk {document.metadata.get('chunk_id', index)}"
        )
        context_parts.append(f"[SOURCE {index}] ({label})\n{document.page_content}")

    return "\n\n---\n\n".join(context_parts)