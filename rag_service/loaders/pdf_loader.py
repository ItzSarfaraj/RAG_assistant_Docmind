from langchain_community.document_loaders import PyPDFLoader


def load_pdf(file_path: str):
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    if not documents:
        raise ValueError(f"Could not extract any text from PDF: {file_path}")
    return documents