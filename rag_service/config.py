import os
import logging
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("docmind")

# Fail fast instead of failing deep inside a request with a confusing error.
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError(
        "GOOGLE_API_KEY environment variable is not set. "
        "Set it in your .env file before starting the service."
    )

VECTOR_STORE_DIR = os.getenv(
    "VECTOR_STORE_DIR",
    str(BASE_DIR / "vectorstores"),
)

UPLOAD_DIR = os.getenv(
    "UPLOAD_DIR",
    str(BASE_DIR.parent / "server" / "uploads"),
)

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "gemini-embedding-001")
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")

DEFAULT_K = int(os.getenv("DEFAULT_K", "4"))
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "1200"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "150"))

# FAISS with these embeddings returns L2 distance - lower is more similar.
# Tune this per-embedding-model if you switch models; set to a large number
# (e.g. 999) to effectively disable filtering while you calibrate it.
RETRIEVAL_SCORE_THRESHOLD = float(os.getenv("RETRIEVAL_SCORE_THRESHOLD", "1.0"))

# Hard caps to stop a runaway/repetition-loop generation (a real failure mode
# with these models, especially on markdown tables) from streaming forever.
# MAX_OUTPUT_TOKENS is the primary defense (passed straight to the model).
# MAX_STREAM_SECONDS / MAX_STREAM_CHARS are a backstop in the streaming loop
# itself, in case the model ignores/exceeds the token cap.
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "8192"))
MAX_STREAM_SECONDS = int(os.getenv("MAX_STREAM_SECONDS", "45"))
MAX_STREAM_CHARS = int(os.getenv("MAX_STREAM_CHARS", "20000"))

os.makedirs(VECTOR_STORE_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Note generation performance tuning
TARGET_BATCH_COUNT = int(os.getenv("TARGET_BATCH_COUNT", "16"))
MIN_BATCH_CHAR_LIMIT = int(os.getenv("MIN_BATCH_CHAR_LIMIT", "8000"))
MAX_BATCH_CHAR_LIMIT = int(os.getenv("MAX_BATCH_CHAR_LIMIT", "60000"))
NOTES_MAX_CONCURRENCY = int(os.getenv("NOTES_MAX_CONCURRENCY", "5"))
NOTES_REDUCE_GROUP_SIZE = int(os.getenv("NOTES_REDUCE_GROUP_SIZE", "6"))
NOTES_LLM_MAX_RETRIES = int(os.getenv("NOTES_LLM_MAX_RETRIES", "3"))