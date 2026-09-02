import asyncio
import random

from generation.llm import get_llm
from config import NOTES_LLM_MAX_RETRIES, logger


async def _invoke_raw(prompt: str, label: str, temperature: float):
    """
    Single call with retries + exponential backoff + jitter.
    Jitter matters here: with many batches running concurrently, if they
    all hit a rate limit at the same instant, un-jittered backoff makes
    them all retry in lockstep — which looks exactly like "stuck".
    Returns the raw response object (caller needs .content and
    .response_metadata for MAX_TOKENS detection).
    """
    delay = 1.5
    llm = get_llm(temperature=temperature)

    for attempt in range(1, NOTES_LLM_MAX_RETRIES + 1):
        try:
            response = await asyncio.wait_for(llm.ainvoke(prompt), timeout=100)
            finish_reason = (response.response_metadata or {}).get("finish_reason")
            if finish_reason == "MAX_TOKENS":
                logger.warning("Output truncated by MAX_TOKENS (%s)", label)
            return response
        except Exception as error:
            if attempt == NOTES_LLM_MAX_RETRIES:
                logger.exception(
                    "LLM call failed permanently (%s, attempt %s/%s)",
                    label, attempt, NOTES_LLM_MAX_RETRIES,
                )
                raise
            logger.warning(
                "LLM call failed (%s, attempt %s/%s): %s — retrying in %.1fs",
                label, attempt, NOTES_LLM_MAX_RETRIES, error, delay,
            )
            await asyncio.sleep(delay + random.uniform(0, delay * 0.3))
            delay *= 2


async def invoke_with_continuation(
    prompt: str,
    label: str,
    temperature: float = 0.2,
    max_continuations: int = 2,
) -> str:
    """
    Call the LLM, and if it stops mid-output because it hit
    max_output_tokens, ask it to continue instead of silently returning
    truncated notes.
    """
    response = await _invoke_raw(prompt, label=label, temperature=temperature)
    full_text = response.content
    continuations = 0

    while (
        (response.response_metadata or {}).get("finish_reason") == "MAX_TOKENS"
        and continuations < max_continuations
    ):
        logger.warning("Continuing truncated output (%s), continuation %s", label, continuations + 1)
        continue_prompt = (
            f"{prompt}\n\n"
            f"PARTIAL OUTPUT SO FAR (do not repeat this, continue exactly where it stops):\n{full_text}"
        )
        response = await _invoke_raw(continue_prompt, label=f"{label}-continuation", temperature=temperature)
        full_text += response.content
        continuations += 1

    return full_text