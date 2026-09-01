import os

from loaders.pdf_loader import load_pdf
from loaders.docx_loader import load_docx
from loaders.text_loader import load_txt
from loaders.web_loader import load_web
from loaders.video_loader import load_video


def load_document(source: str, source_type: str = "file"):
    if source_type == "web":
        return load_web(source)

    if source_type == "video":
        return load_video(source)

    if source_type != "file":
        raise ValueError(f"Unsupported source_type: {source_type}")

    extension = os.path.splitext(source)[1].lower()

    if extension == ".pdf":
        return load_pdf(source)
    if extension == ".docx":
        return load_docx(source)
    if extension == ".txt":
        return load_txt(source)

    raise ValueError(f"Unsupported file type: {extension}")