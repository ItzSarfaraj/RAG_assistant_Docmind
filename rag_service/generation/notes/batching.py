import re

from config import TARGET_BATCH_COUNT, MIN_BATCH_CHAR_LIMIT, MAX_BATCH_CHAR_LIMIT

# Bigger batches for concise structures (fewer, larger LLM calls);
# smaller batches for structures that need per-concept depth.
TARGET_BATCHES_BY_STRUCTURE = {
    "revision": 10,
    "structured": 16,
    "study": 18,
    "handbook": 22,
}


def remove_timestamps(text: str) -> str:
    if not text:
        return text
    return re.sub(r"\[\d{1,2}:\d{2}(?::\d{2})?\]", "", text)


def create_batches(context: str, note_structure: str = "structured"):
    if not context or not context.strip():
        return []

    chunks = context.split("\n\n---\n\n")
    total_length = sum(len(chunk) for chunk in chunks)

    target_batches = TARGET_BATCHES_BY_STRUCTURE.get(note_structure, TARGET_BATCH_COUNT)

    char_limit = max(
        MIN_BATCH_CHAR_LIMIT,
        min(MAX_BATCH_CHAR_LIMIT, total_length // max(target_batches, 1)),
    )

    batches = []
    current_batch = []
    current_length = 0

    for chunk in chunks:
        chunk_length = len(chunk)

        if current_batch and current_length + chunk_length > char_limit:
            batches.append("\n\n---\n\n".join(current_batch))
            current_batch = []
            current_length = 0

        current_batch.append(chunk)
        current_length += chunk_length

    if current_batch:
        batches.append("\n\n---\n\n".join(current_batch))

    return batches