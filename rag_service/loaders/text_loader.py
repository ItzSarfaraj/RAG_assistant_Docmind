from langchain_community.document_loaders import TextLoader


def load_txt(file_path: str):
    loader = TextLoader(file_path, encoding="utf-8")
    documents = loader.load()
    if not documents:
        raise ValueError(f"Could not extract any text from file: {file_path}")
    return documents