from langchain_google_genai import ChatGoogleGenerativeAI

from config import MAX_OUTPUT_TOKENS, LLM_MODEL, GOOGLE_API_KEY

# Cached per-temperature so chat (temperature=0) and note generation
# (temperature=0.2) share one client setup instead of each file
# instantiating its own — this was the source of the duplication.
_llm_cache: dict[float, ChatGoogleGenerativeAI] = {}


def get_llm(temperature: float = 0.0) -> ChatGoogleGenerativeAI:
    if temperature not in _llm_cache:
        _llm_cache[temperature] = ChatGoogleGenerativeAI(
            model=LLM_MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=temperature,
            max_output_tokens=MAX_OUTPUT_TOKENS,
            timeout=100,       # hard ceiling — prevents indefinite hangs
            max_retries=0,     # retries are handled explicitly by callers
        )
    return _llm_cache[temperature]