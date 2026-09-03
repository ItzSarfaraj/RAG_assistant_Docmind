import json

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from rag_pipeline.pipeline import (
    index_document,
    remove_document,
    ask_question,
    astream_answer,
    generate_video_notes,
    astream_video_notes,
    _build_notes_context,
    search_documents
)
from config import logger
from generation.flashcards import generate_flashcards
 


app = FastAPI(
    title="DocMind RAG Service",
    description="RAG service for DocMind",
    version="1.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request Models
# ============================================================

class IndexRequest(BaseModel):
    source: str
    document_id: str
    source_type: str = "file"

    @field_validator("source_type")
    @classmethod
    def validate_source_type(cls, value: str) -> str:
        if value not in {"file", "web", "video"}:
            raise ValueError("source_type must be one of: file, web, video")
        return value


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    question: str
    document_id: str
    k: int = 4
    chat_history: list[ChatMessage] = Field(default_factory=list)


class NoteInclude(BaseModel):
    summary: bool = True
    keyConcepts: bool = True
    examples: bool = True
    code: bool = False
    flowcharts: bool = False
    diagrams: bool = False
    tables: bool = False
    keyTakeaways: bool = True
    interviewQuestions: bool = False


class NotesRequest(BaseModel):
    document_id: list[str]
    detail_level: str = "detailed"
    explanation_level: str = "intermediate"
    note_structure: str = "structured"
    include: NoteInclude = Field(default_factory=NoteInclude)
    faithful_to_video: bool = True

    @field_validator("note_structure")
    @classmethod
    def validate_note_structure(cls, value: str) -> str:
        allowed = {"structured", "study", "handbook", "revision"}

        if value not in allowed:
            raise ValueError(
                "note_structure must be one of: "
                "structured, study, handbook, revision"
            )

        return value

class FlashcardRequest(BaseModel):
    document_ids: list[str]
    count: int = 15  

class SearchRequest(BaseModel):
    query: str
    document_ids: list[str]
    k: int = 10      


# ============================================================
# Document Indexing
# ============================================================

@app.post("/documents/index")
def index_document_endpoint(request: IndexRequest):
    try:
        return index_document(
            source=request.source,
            document_id=request.document_id,
            source_type=request.source_type,
        )
    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception("Failed to index document_id=%s", request.document_id)
        raise HTTPException(status_code=500, detail="Indexing failed. Please try again.")


# ============================================================
# Delete Document
# ============================================================

@app.delete("/documents/{document_id}")
def delete_document_endpoint(document_id: str):
    try:
        return remove_document(document_id)
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception("Failed to delete document_id=%s", document_id)
        raise HTTPException(status_code=500, detail="Failed to delete document.")


# ============================================================
# Chat
# ============================================================

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
        raise HTTPException(
            status_code=500,
            detail="Something went wrong answering that question.",
        )


# ============================================================
# Streaming Chat
# ============================================================

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
            logger.exception(
                "Error while streaming answer for document_id=%s",
                request.document_id,
            )
            yield f"data: {json.dumps({'type': 'error', 'message': str(error)})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )


# ============================================================
# Generate Notes
# ============================================================

@app.post("/notes/generate")
async def generate_notes_endpoint(request: NotesRequest):
    try:
        return await generate_video_notes(
            document_id=request.document_id,
            detail_level=request.detail_level,
            explanation_level=request.explanation_level,
            note_structure=request.note_structure,
            include=request.include.model_dump(),
            faithful_to_video=request.faithful_to_video,
        )
    except FileNotFoundError as error:
        raise HTTPException(status_code=404, detail=str(error))
    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception(
            "Failed to generate notes for document_id=%s",
            request.document_id,
        )
        raise HTTPException(
            status_code=500,
            detail="Note generation failed. Please try again.",
        )


@app.post("/notes/generate/stream")
def generate_notes_stream_endpoint(request: NotesRequest):
    async def generate():
        try:
            async for item in astream_video_notes(
                document_id=request.document_id,
                detail_level=request.detail_level,
                explanation_level=request.explanation_level,
                note_structure=request.note_structure,
                include=request.include.model_dump(),
                faithful_to_video=request.faithful_to_video,
            ):
                yield f"data: {json.dumps(item)}\n\n"
        except Exception:
            logger.exception(
                "Error while streaming notes for document_id=%s",
                request.document_id,
            )
            yield f"data: {json.dumps({'type': 'error', 'message': 'Note generation failed.'})}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )

@app.post("/flashcards/generate")
async def generate_flashcards_endpoint(request: FlashcardRequest):
    try:
        context, _ = _build_notes_context(request.document_ids)
        cards = await generate_flashcards(context, count=request.count)
        return {"cards": cards}
    except (ValueError, FileNotFoundError) as error:
        raise HTTPException(status_code=400, detail=str(error))
    except Exception:
        logger.exception("Flashcard generation failed")
        raise HTTPException(status_code=500, detail="Flashcard generation failed.")

@app.post("/search")
def search_endpoint(request: SearchRequest):
    try:
        results = search_documents(
            query=request.query,
            document_ids=request.document_ids,
            k=request.k,
        )

        return {"results": results}

    except ValueError as error:
        raise HTTPException(status_code=400, detail=str(error))

    except Exception:
        logger.exception("Search failed")
        raise HTTPException(
            status_code=500,
            detail="Search failed. Please try again.",
        )    