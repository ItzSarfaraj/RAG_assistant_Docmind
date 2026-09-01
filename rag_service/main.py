import json

from dotenv import load_dotenv

load_dotenv()  # must run before any module reads GOOGLE_API_KEY via config.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, field_validator

from rag_pipeline.pipeline import index_document, remove_document, ask_question, astream_answer
from config import logger

app = FastAPI(
    title="DocMind RAG Service",
    description="RAG service for DocMind",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend's origin(s) in production
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Request / Response Models
# ==========================================

class IndexRequest(BaseModel):
    source: str  # file path (source_type="file") or a URL (source_type="web"/"video")
    document_id: str
    source_type: str = "file"

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        if value not in {"file", "web", "video"}:
            raise ValueError("source_type must be one of: file, web, video")
        return value


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    question: str
    document_id: str
    k: int = 4
    chat_history: list[ChatMessage] = []


# ==========================================
# Health Check
# ==========================================

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "DocMind RAG service is running"}


# ==========================================
# Document Indexing
# ==========================================

@app.post("/documents/index")
def index_document_endpoint(request: IndexRequest):
    try:
        return index_document(
            source=request.source,
            document_id=request.document_id,
            source_type=request.source_type,
        )
    except (ValueError, FileNotFoundError) as error:
        # Bad input from the caller - not a server bug.
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception("Failed to index document_id=%s", request.document_id)
        raise HTTPException(status_code=500, detail="Indexing failed. Please try again.")


@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: str):
    return remove_document(document_id)


# ==========================================
# Chat / Question Answering (non-streaming)
# ==========================================

@app.post("/chat/answer")
def answer_endpoint(request: ChatRequest):
    try:
        history = [message.model_dump() for message in request.chat_history]
        return ask_question(
            question=request.question,
            document_id=request.document_id,
            k=request.k,
            chat_history=history,
        )
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception("Failed to answer question for document_id=%s", request.document_id)
        raise HTTPException(status_code=500, detail="Something went wrong answering that question.")


# ==========================================
# Chat / Question Answering (streamed)
# ==========================================

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    history = [message.model_dump() for message in request.chat_history]

    async def generate():
        try:
            async for item in astream_answer(
                question=request.question,
                document_id=request.document_id,
                k=request.k,
                chat_history=history,
            ):
                yield f"data: {json.dumps(item)}\n\n"
        except Exception as error:
            logger.exception("Error while streaming answer for document_id=%s", request.document_id)
            yield f"data: {json.dumps({'type': 'error', 'message': str(error)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )