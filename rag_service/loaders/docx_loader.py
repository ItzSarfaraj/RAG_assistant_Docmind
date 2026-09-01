from langchain_community.document_loaders import Docx2txtLoader


def load_docx(file_path: str):
    loader = Docx2txtLoader(file_path)
    documents = loader.load()
    if not documents:
        raise ValueError(f"Could not extract any text from DOCX: {file_path}")
    return documents