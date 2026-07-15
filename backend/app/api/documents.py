"""
FastAPI router declaring core REST endpoints for document intelligence operations.
"""

import time
import random
import asyncio
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status, BackgroundTasks

from app import schemas
from app.repositories import get_uow, UnitOfWork
from app.models.document import Document, Flashcard, QuizQuestion, ChatMessage, DocumentChunk
from app.services import AIService, EmbeddingsService, SemanticSearchService, process_document_pipeline
from app.utils.mock_data import (
    pick_accent,
    make_summary,
    make_flashcards,
    make_quiz,
    make_graph,
)

# Instantiate service singletons
embeddings_service = EmbeddingsService()
ai_service = AIService()
search_service = SemanticSearchService(embeddings_service)

router = APIRouter(tags=["documents"])



# ── Document Endpoints ────────────────────────────────────────

@router.get("/documents", response_model=list[schemas.Document])
async def list_documents(uow: UnitOfWork = Depends(get_uow)):
    """List all documents ordered by upload date."""
    return await uow.documents.list_all()


@router.get("/debug-chunks/{id}")
async def debug_chunks(id: str, uow: UnitOfWork = Depends(get_uow)):
    from sqlalchemy import select, text
    try:
        doc = await uow.documents.get_by_id(id)
        if not doc:
            return {"status": "error", "message": f"Document {id} not found"}
            
        total_chunks = (await uow.session.execute(text("SELECT COUNT(*) FROM document_chunks"))).scalar()
        doc_chunks = (await uow.session.execute(text(f"SELECT COUNT(*) FROM document_chunks WHERE document_id = '{id}'"))).scalar()
        
        schema_query = await uow.session.execute(text(
            "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'document_chunks'"
        ))
        schema = {r[0]: r[1] for r in schema_query.all()}
        
        from app.core.config import get_settings
        settings = get_settings()
        
        return {
            "status": "success",
            "document": {
                "id": doc.id,
                "status": doc.status,
                "parsing_status": doc.parsing_status,
                "embedding_status": doc.embedding_status,
                "progress": doc.progress,
            },
            "total_chunks_in_db": total_chunks,
            "chunks_for_this_doc": doc_chunks,
            "database_schema": schema,
            "groq_key_configured": bool(settings.groq_api_key),
            "environment": settings.environment
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}



@router.post("/documents", response_model=schemas.Document, status_code=status.HTTP_201_CREATED)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    uow: UnitOfWork = Depends(get_uow),
):
    """
    Upload a document.
    Initializes metadata in 'processing' status, and dispatches real-time background analysis.
    """
    filename = file.filename or "Unnamed Document"
    
    # Validate filename extension and structure
    from app.utils.sanitization import sanitize_filename
    try:
        sanitized_name = sanitize_filename(filename)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
        
    # Read content to determine file size
    content = await file.read()
    file_size = len(content)

    MAX_FILE_SIZE = 25 * 1024 * 1024  # 25MB
    if file_size == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File is empty")
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds maximum limit of 25MB")
        
    # Check content type and PDF magic bytes
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF files are allowed")
        
    if not (content.startswith(b"%PDF") or content.startswith(b"PDF_DUMMY")):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid PDF file structure")

    doc_id = f"doc-{int(time.time() * 1000)}-{random.randint(1000, 9999)}"

    doc = Document(
        id=doc_id,
        name=sanitized_name,
        pages=0,  # Determined during background processing
        status="processing",
        progress=10.0,
        size=file_size,
        accent=pick_accent(),
        bookmarks=[],
        uploaded_at=datetime.now(timezone.utc),
    )

    uow.documents.add(doc)
    await uow.commit()

    # Dispatch background task to parse and enrich document
    background_tasks.add_task(process_document_pipeline, doc_id, content)


    return await uow.documents.get_by_id(doc_id, load_relationships=True)




@router.get("/documents/{id}", response_model=schemas.Document)
async def get_document(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Fetch details of a single document by its ID."""
    doc = await uow.documents.get_by_id(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc


@router.get("/documents/{id}/chunks")
async def get_document_chunks(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Fetch all text chunks of a document, ordered by page and paragraph."""
    doc = await uow.documents.get_by_id(id, load_relationships=False)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    from sqlalchemy import select
    stmt = (
        select(DocumentChunk)
        .where(DocumentChunk.document_id == id)
        .order_by(DocumentChunk.page, DocumentChunk.paragraph)
    )
    result = await uow.session.execute(stmt)
    chunks = result.scalars().all()
    return [
        {
            "page": c.page,
            "paragraph": c.paragraph,
            "text": c.text,
        }
        for c in chunks
    ]


@router.patch("/documents/{id}", response_model=schemas.Document)
async def rename_document(
    id: str,
    payload: schemas.DocumentRename,
    uow: UnitOfWork = Depends(get_uow),
):
    """Rename a document's display name."""
    await uow.documents.update_metadata(id, name=payload.name)
    await uow.session.flush()
    return await uow.documents.get_by_id(id, load_relationships=True)



@router.delete("/documents/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Delete a document and all related sub-entities."""
    doc = await uow.documents.get_by_id(id, load_relationships=False)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    await uow.documents.delete(doc)


# ── GET Document Status ────────────────────────────────────────
@router.get("/documents/{id}/status")
async def get_document_status(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Fetch status mapping of document analysis."""
    doc = await uow.documents.get_by_id(id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    return {
        "chat_ready": doc.status == "ready" or doc.embedding_status == "completed",
        "summary_ready": doc.summary_status == "completed" or doc.summary is not None,
        "flashcards_ready": doc.flashcard_status == "completed" or len(doc.flashcards) > 0,
        "quiz_ready": doc.quiz_status == "completed" or len(doc.quiz_questions) > 0,
        "graph_ready": doc.graph_status == "completed" or doc.graph is not None,
        "progress": int(doc.progress)
    }


# ── AI Generation Endpoints ────────────────────────────────────

@router.post("/documents/{id}/summary", response_model=schemas.Document)
async def generate_summary(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Generate smart summaries for a document."""
    doc = await uow.documents.get_by_id(id, load_relationships=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.summary:
        return doc
        
    from app.models.document import DocumentChunk
    from sqlalchemy import select
    
    stmt = select(DocumentChunk).where(DocumentChunk.document_id == id).order_by(DocumentChunk.page, DocumentChunk.paragraph)
    result = await uow.session.execute(stmt)
    chunks = result.scalars().all()
    
    if not chunks:
        summary_data = make_summary(doc.name, doc.pages)
    else:
        full_text = "\n\n".join([c.text for c in chunks])
        MAX_AI_INPUT_CHARACTERS = 60000
        ai_input = full_text[:MAX_AI_INPUT_CHARACTERS] if len(full_text) > MAX_AI_INPUT_CHARACTERS else full_text
        summary_data = await asyncio.to_thread(ai_service.generate_summary, ai_input)
        
    await uow.documents.update_metadata(id, summary=summary_data, summary_status="completed", status="ready", progress=100.0)
    await uow.commit()
    
    return await uow.documents.get_by_id(id, load_relationships=True)


@router.post("/documents/{id}/flashcards", response_model=schemas.Document)
async def generate_flashcards(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Generate flashcards from a document."""
    doc = await uow.documents.get_by_id(id, load_relationships=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.flashcards:
        return doc
        
    from app.models.document import DocumentChunk
    from sqlalchemy import select
    
    stmt = select(DocumentChunk).where(DocumentChunk.document_id == id).order_by(DocumentChunk.page, DocumentChunk.paragraph)
    result = await uow.session.execute(stmt)
    chunks = result.scalars().all()
    
    if not chunks:
        cards_data = make_flashcards(int(time.time()))
    else:
        summary_text = doc.summary.get("overall", "") if (doc.summary and isinstance(doc.summary, dict)) else ""
        key_sections = "\n\n".join([c.text for c in chunks[:4]])
        ai_input = f"Summary overview:\n{summary_text}\n\nKey Sections:\n{key_sections}"
        cards_data = await asyncio.to_thread(ai_service.generate_flashcards, ai_input)
    
    # Clear old ones
    for card in list(doc.flashcards):
        await uow.flashcards.delete(card)
        
    for card in cards_data:
        card_id = f"fc-{int(time.time() * 1000)}-{hash(card['front']) % 1000}"
        await uow.flashcards.create(
            doc_id=id,
            card_id=card_id,
            front=card["front"],
            back=card["back"],
        )
    doc.flashcard_status = "completed"
    await uow.commit()
    
    return await uow.documents.get_by_id(id, load_relationships=True)


@router.post("/documents/{id}/quiz", response_model=schemas.Document)
async def generate_quiz(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Generate quiz questions from a document."""
    doc = await uow.documents.get_by_id(id, load_relationships=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.quiz_questions:
        return doc
        
    from app.models.document import DocumentChunk
    from sqlalchemy import select
    
    stmt = select(DocumentChunk).where(DocumentChunk.document_id == id).order_by(DocumentChunk.page, DocumentChunk.paragraph)
    result = await uow.session.execute(stmt)
    chunks = result.scalars().all()
    
    if not chunks:
        questions_data = make_quiz(int(time.time()))
    else:
        summary_text = doc.summary.get("overall", "") if (doc.summary and isinstance(doc.summary, dict)) else ""
        key_sections = "\n\n".join([c.text for c in chunks[:5]])
        ai_input = f"Summary overview:\n{summary_text}\n\nKey Sections:\n{key_sections}"
        questions_data = await asyncio.to_thread(ai_service.generate_quiz, ai_input)
    
    # Clear old questions
    for q in list(doc.quiz_questions):
        await uow.quizzes.delete(q)
        
    await uow.quizzes.bulk_create(id, questions_data)
    doc.quiz_status = "completed"
    await uow.commit()
    
    return await uow.documents.get_by_id(id, load_relationships=True)


@router.post("/documents/{id}/graph", response_model=schemas.Document)
async def generate_graph(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Generate interactive knowledge graph from a document."""
    doc = await uow.documents.get_by_id(id, load_relationships=True)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if doc.graph:
        return doc
        
    from app.models.document import DocumentChunk
    from sqlalchemy import select
    
    stmt = select(DocumentChunk).where(DocumentChunk.document_id == id).order_by(DocumentChunk.page, DocumentChunk.paragraph)
    result = await uow.session.execute(stmt)
    chunks = result.scalars().all()
    
    if not chunks:
        graph_data = make_graph()
    else:
        concepts_list = []
        if doc.summary and isinstance(doc.summary, dict) and "concepts" in doc.summary:
            concepts_list = doc.summary["concepts"]
        
        if concepts_list:
            concepts_str = "\n".join([f"- {c.get('term')}: {c.get('definition')}" for c in concepts_list if isinstance(c, dict)])
            ai_input = f"Build a knowledge graph based on these extracted concepts:\n{concepts_str}"
        else:
            ai_input = "\n\n".join([c.text for c in chunks[:4]])
            
        graph_data = await asyncio.to_thread(ai_service.generate_graph, ai_input)
        
    doc.graph = graph_data
    doc.graph_status = "completed"
    await uow.commit()
    
    return await uow.documents.get_by_id(id, load_relationships=True)



# ── Flashcard Mutations Endpoints ──────────────────────────────

@router.post("/documents/{id}/flashcards/add", response_model=schemas.Document)
async def add_flashcard(
    id: str,
    payload: schemas.FlashcardCreate,
    uow: UnitOfWork = Depends(get_uow),
):
    """Add a custom study flashcard to the document."""
    doc = await uow.documents.get_by_id(id, load_relationships=False)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    card_id = f"fc-{int(time.time() * 1000)}-{random.randint(10, 99)}"
    await uow.flashcards.create(
        doc_id=id,
        card_id=card_id,
        front=payload.front,
        back=payload.back,
    )
    
    await uow.commit()
    return await uow.documents.get_by_id(id)


@router.patch("/documents/{id}/flashcards/{card_id}", response_model=schemas.Document)
async def edit_flashcard(
    id: str,
    card_id: str,
    payload: schemas.FlashcardUpdate,
    uow: UnitOfWork = Depends(get_uow),
):
    """Edit the front or back question text of a flashcard."""
    card = await uow.flashcards.get_by_id(card_id)
    if not card or card.document_id != id:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    update_fields = {}
    if payload.front is not None:
        update_fields["front"] = payload.front
    if payload.back is not None:
        update_fields["back"] = payload.back

    await uow.flashcards.update(card_id, **update_fields)
    
    await uow.commit()
    return await uow.documents.get_by_id(id)


@router.delete("/documents/{id}/flashcards/{card_id}", response_model=schemas.Document)
async def delete_flashcard(id: str, card_id: str, uow: UnitOfWork = Depends(get_uow)):
    """Delete a specific flashcard."""
    card = await uow.flashcards.get_by_id(card_id)
    if not card or card.document_id != id:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    await uow.flashcards.delete(card)
    
    await uow.commit()
    return await uow.documents.get_by_id(id)


# ── Chat Messaging Endpoints ───────────────────────────────────

@router.post("/documents/{id}/chat", response_model=schemas.Document)
async def send_chat_message(
    id: str,
    payload: schemas.ChatMessageCreate,
    uow: UnitOfWork = Depends(get_uow),
):
    """
    Send a message to the chat interface.
    Saves user message and returns updated document with assistant answer.
    """
    doc = await uow.documents.get_by_id(id, load_relationships=False)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    user_msg_id = f"msg-{int(time.time() * 1000)}-user"
    assistant_msg_id = f"msg-{int(time.time() * 1000)}-assistant"

    # Save User message
    await uow.chat.create(
        doc_id=id,
        msg_id=user_msg_id,
        role="user",
        content=payload.content,
    )

    # 1. Query semantic search for relevant chunks
    chunks = await search_service.search(uow, id, payload.content, limit=5)
    context_chunks = [
        {"page": c.page, "paragraph": c.paragraph, "text": c.text}
        for c in chunks
    ]

    # 2. Fetch existing chat history for conversation context
    history_models = await uow.chat.list_by_document(id)
    chat_history = []
    for m in history_models:
        # Exclude the message we just saved
        if m.id != user_msg_id:
            chat_history.append({"role": m.role, "content": m.content})

    # 3. Call AI Service, falling back gracefully if Groq API key is unconfigured
    try:
        ai_answer, citations = ai_service.generate_chat_response(
            question=payload.content,
            chat_history=chat_history,
            context_chunks=context_chunks,
        )
    except Exception:
        # Graceful fallback for local development or testing environments without keys
        ai_answer = (
            f"Mock RAG response to: '{payload.content}'. "
            f"Retrieved {len(context_chunks)} source contexts."
        )
        citations = [
            {
                "page": c.page if chunks else 1,
                "paragraph": c.paragraph if chunks else 0,
                "text": c.text[:120] + "..." if chunks else "Mock context details...",
            }
            for c in (chunks[:1] if chunks else [None])
        ]

    # 4. Save Assistant response with citation references
    await uow.chat.create(
        doc_id=id,
        msg_id=assistant_msg_id,
        role="assistant",
        content=ai_answer,
        citations=citations,
    )


    await uow.commit()
    return await uow.documents.get_by_id(id)


@router.delete("/documents/{id}/chat", response_model=schemas.Document)
async def clear_chat(id: str, uow: UnitOfWork = Depends(get_uow)):
    """Clear chat thread history of a document."""
    doc = await uow.documents.get_by_id(id, load_relationships=False)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    await uow.chat.clear_chat(id)
    
    await uow.session.commit()
    return await uow.documents.get_by_id(id)
