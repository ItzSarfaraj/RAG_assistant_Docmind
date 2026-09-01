from langchain_google_genai import ChatGoogleGenerativeAI

from config import MAX_OUTPUT_TOKENS, LLM_MODEL


def get_llm():

    llm = ChatGoogleGenerativeAI(
        model=LLM_MODEL,
        temperature=0,
        max_output_tokens=MAX_OUTPUT_TOKENS,
    )

    return llm