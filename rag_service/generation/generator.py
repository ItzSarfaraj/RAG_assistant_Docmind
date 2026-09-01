from generation.llm import get_llm
from generation.prompt import get_rag_prompt


def _format_history(chat_history) -> str:
    if not chat_history:
        return "None."
    # Cap history so a long chat doesn't blow up the prompt/token budget.
    turns = chat_history[-6:]
    return "\n".join(f"{turn.get('role', 'user')}: {turn.get('content', '')}" for turn in turns)


def generate_answer(question: str, context: str, chat_history=None) -> str:
    prompt = get_rag_prompt()
    llm = get_llm()
    chain = prompt | llm

    response = chain.invoke({
        "context": context,
        "question": question,
        "chat_history": _format_history(chat_history),
    })
    return response.content


def stream_answer_from_llm(question: str, context: str, chat_history=None):
    prompt = get_rag_prompt()
    llm = get_llm()
    chain = prompt | llm

    for chunk in chain.stream({
        "context": context,
        "question": question,
        "chat_history": _format_history(chat_history),
    }):
        if chunk.content:
            yield chunk.content


async def astream_answer_from_llm(question: str, context: str, chat_history=None):
    """
    Async version so the FastAPI event loop isn't blocked while waiting on
    network I/O to the Gemini API during a stream.
    """
    prompt = get_rag_prompt()
    llm = get_llm()
    chain = prompt | llm

    async for chunk in chain.astream({
        "context": context,
        "question": question,
        "chat_history": _format_history(chat_history),
    }):
        if chunk.content:
            yield chunk.content