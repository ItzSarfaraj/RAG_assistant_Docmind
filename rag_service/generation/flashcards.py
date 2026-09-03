import json
from generation.notes.llm_calls import invoke_with_continuation

FLASHCARD_PROMPT = """
You are an expert at creating spaced-repetition flashcards for studying.

Create {count} flashcards from the following study material.
Each flashcard should test ONE specific fact, concept, or definition.

Rules:
1. Questions must be answerable from the material alone.
2. Keep answers concise (1-3 sentences).
3. Avoid yes/no questions.
4. Cover a spread of concepts, not just the first section.
5. Return ONLY valid JSON, no markdown fences, no commentary.

Return this exact JSON shape:
{{"cards": [{{"question": "...", "answer": "..."}}]}}

MATERIAL:
{context}
"""

async def generate_flashcards(context: str, count: int = 15) -> list[dict]:
    prompt = FLASHCARD_PROMPT.format(count=count, context=context)
    raw = await invoke_with_continuation(prompt, label="flashcards", temperature=0.3)

    cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    data = json.loads(cleaned)
    return data.get("cards", [])