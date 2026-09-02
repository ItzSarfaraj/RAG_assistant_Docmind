# Kept for backward compatibility — rag_pipeline/pipeline.py imports
# `generate_notes` from this path. Actual implementation lives in
# generation/notes/pipeline.py, split out for readability.
from generation.notes.pipeline import generate_notes

__all__ = ["generate_notes"]