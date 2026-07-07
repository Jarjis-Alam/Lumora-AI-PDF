"""
Asynchronous PDF processing pipeline executing text extraction, embedding generation,
and AI asset creation in the background.
"""

import asyncio
import time
from app.core.database import async_session_factory
from app.core.logging import get_logger
from app.repositories import UnitOfWork
from app.models.document import DocumentChunk
from app.services.pdf import PDFProcessor
from app.services.embeddings import EmbeddingsService
from app.services.ai import AIService
from app.utils.mock_data import (
    make_summary,
    make_flashcards,
    make_quiz,
    make_graph,
)

logger = get_logger("pipeline")


async def generate_background_summary(doc_id: str, chunks: list[dict]) -> None:
    logger.info("[%s] Background task: summary generation starting...", doc_id)
    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    ai_service = AIService()
    
    async with factory() as session:
        async with UnitOfWork(session) as uow:
            doc = await uow.documents.get_by_id(doc_id)
            if not doc:
                return
            if doc.summary:
                doc.summary_status = "completed"
                await uow.commit()
                return
            try:
                doc.summary_status = "processing"
                await uow.session.flush()
                
                full_text = "\n\n".join([c["text"] for c in chunks]) if chunks else ""
                MAX_AI_INPUT_CHARACTERS = 60000
                ai_input = full_text[:MAX_AI_INPUT_CHARACTERS] if len(full_text) > MAX_AI_INPUT_CHARACTERS else full_text
                
                summary_data = await asyncio.to_thread(ai_service.generate_summary, ai_input)
                
                # Retrieve fresh instance within this session
                doc = await uow.documents.get_by_id(doc_id)
                doc.summary = summary_data
                doc.summary_status = "completed"
                doc.progress = min(doc.progress + 12.5, 100.0)
                await uow.commit()
                logger.info("[%s] Background summary generation completed", doc_id)
            except Exception as e:
                logger.exception("[%s] Background summary generation failed: %s", doc_id, e)
                doc = await uow.documents.get_by_id(doc_id)
                if doc:
                    doc.summary_status = "failed"
                    await uow.commit()


async def generate_background_flashcards(doc_id: str, chunks: list[dict]) -> None:
    logger.info("[%s] Background task: flashcards generation starting...", doc_id)
    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    ai_service = AIService()
    
    async with factory() as session:
        async with UnitOfWork(session) as uow:
            doc = await uow.documents.get_by_id(doc_id, load_relationships=True)
            if not doc:
                return
            if doc.flashcards:
                doc.flashcard_status = "completed"
                await uow.commit()
                return
            try:
                doc.flashcard_status = "processing"
                await uow.session.flush()
                
                # Token optimization: Use summary + key sections
                summary_text = doc.summary.get("overall", "") if (doc.summary and isinstance(doc.summary, dict)) else ""
                key_sections = "\n\n".join([c["text"] for c in chunks[:4]]) if chunks else ""
                ai_input = f"Summary overview:\n{summary_text}\n\nKey Sections:\n{key_sections}"
                
                cards_data = await asyncio.to_thread(ai_service.generate_flashcards, ai_input)
                
                doc = await uow.documents.get_by_id(doc_id, load_relationships=True)
                for card in list(doc.flashcards):
                    await uow.flashcards.delete(card)
                    
                for card in cards_data:
                    card_id = f"fc-{int(time.time() * 1000)}-{hash(card['front']) % 1000}"
                    await uow.flashcards.create(
                        doc_id=doc_id,
                        card_id=card_id,
                        front=card["front"],
                        back=card["back"],
                    )
                doc.flashcard_status = "completed"
                doc.progress = min(doc.progress + 12.5, 100.0)
                await uow.commit()
                logger.info("[%s] Background flashcard generation completed", doc_id)
            except Exception as e:
                logger.exception("[%s] Background flashcard generation failed: %s", doc_id, e)
                doc = await uow.documents.get_by_id(doc_id)
                if doc:
                    doc.flashcard_status = "failed"
                    await uow.commit()


async def generate_background_quiz(doc_id: str, chunks: list[dict]) -> None:
    logger.info("[%s] Background task: quiz generation starting...", doc_id)
    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    ai_service = AIService()
    
    async with factory() as session:
        async with UnitOfWork(session) as uow:
            doc = await uow.documents.get_by_id(doc_id, load_relationships=True)
            if not doc:
                return
            if doc.quiz_questions:
                doc.quiz_status = "completed"
                await uow.commit()
                return
            try:
                doc.quiz_status = "processing"
                await uow.session.flush()
                
                # Token optimization: Use summary + key sections
                summary_text = doc.summary.get("overall", "") if (doc.summary and isinstance(doc.summary, dict)) else ""
                key_sections = "\n\n".join([c["text"] for c in chunks[:5]]) if chunks else ""
                ai_input = f"Summary overview:\n{summary_text}\n\nKey Sections:\n{key_sections}"
                
                quiz_data = await asyncio.to_thread(ai_service.generate_quiz, ai_input)
                
                doc = await uow.documents.get_by_id(doc_id, load_relationships=True)
                for q in list(doc.quiz_questions):
                    await uow.quizzes.delete(q)
                    
                await uow.quizzes.bulk_create(doc_id, quiz_data)
                doc.quiz_status = "completed"
                doc.progress = min(doc.progress + 12.5, 100.0)
                await uow.commit()
                logger.info("[%s] Background quiz generation completed", doc_id)
            except Exception as e:
                logger.exception("[%s] Background quiz generation failed: %s", doc_id, e)
                doc = await uow.documents.get_by_id(doc_id)
                if doc:
                    doc.quiz_status = "failed"
                    await uow.commit()


async def generate_background_graph(doc_id: str, chunks: list[dict]) -> None:
    logger.info("[%s] Background task: graph generation starting...", doc_id)
    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    ai_service = AIService()
    
    async with factory() as session:
        async with UnitOfWork(session) as uow:
            doc = await uow.documents.get_by_id(doc_id)
            if not doc:
                return
            if doc.graph:
                doc.graph_status = "completed"
                await uow.commit()
                return
            try:
                doc.graph_status = "processing"
                await uow.session.flush()
                
                # Token optimization: Use summary concepts if available, fallback to key sections
                concepts_list = []
                if doc.summary and isinstance(doc.summary, dict) and "concepts" in doc.summary:
                    concepts_list = doc.summary["concepts"]
                
                if concepts_list:
                    concepts_str = "\n".join([f"- {c.get('term')}: {c.get('definition')}" for c in concepts_list if isinstance(c, dict)])
                    ai_input = f"Build a knowledge graph based on these extracted concepts:\n{concepts_str}"
                else:
                    ai_input = "\n\n".join([c["text"] for c in chunks[:4]]) if chunks else ""
                
                graph_data = await asyncio.to_thread(ai_service.generate_graph, ai_input)
                
                doc = await uow.documents.get_by_id(doc_id)
                doc.graph = graph_data
                doc.graph_status = "completed"
                doc.progress = 100.0
                await uow.commit()
                logger.info("[%s] Background graph generation completed", doc_id)
            except Exception as e:
                logger.exception("[%s] Background graph generation failed: %s", doc_id, e)
                doc = await uow.documents.get_by_id(doc_id)
                if doc:
                    doc.graph_status = "failed"
                    await uow.commit()


async def animate_progress(doc_id: str, target_val: float, steps: int = 15, interval: float = 0.15) -> None:
    """Increment progress smoothly in the database toward target_val to show loading bar progress."""
    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    
    for step in range(steps):
        await asyncio.sleep(interval)
        async with factory() as session:
            async with UnitOfWork(session) as uow:
                doc = await uow.documents.get_by_id(doc_id)
                if not doc or doc.status != "processing" or doc.progress >= target_val:
                    return
                # Calculate progress increment
                diff = target_val - doc.progress
                if diff <= 0:
                    return
                step_size = diff / (steps - step)
                doc.progress = min(doc.progress + step_size, target_val - 1.0)
                await uow.commit()


async def run_background_pipeline_chain(doc_id: str, chunks: list[dict]) -> None:
    """Executes background tasks in a sequence to maximize prompt/token optimizations."""
    # 1. Generate Summary first so other tasks can reuse its concepts
    await generate_background_summary(doc_id, chunks)
    
    # 2. Run remaining tasks concurrently, keeping failures isolated
    await asyncio.gather(
        generate_background_flashcards(doc_id, chunks),
        generate_background_quiz(doc_id, chunks),
        generate_background_graph(doc_id, chunks),
        return_exceptions=True
    )


async def process_document_pipeline(doc_id: str, file_bytes: bytes) -> None:
    """
    Consolidated background task executing PDF parsing, embedding calculation,
    and triggering asynchronous AI content generations in the background.
    """
    logger.info("Starting processing pipeline for document: %s", doc_id)

    # Initialize dependencies inside task scope
    embeddings_service = EmbeddingsService()

    from app.core import database
    factory = database.testing_session_factory or database.async_session_factory
    async with factory() as session:
        async with UnitOfWork(session) as uow:
            doc = await uow.documents.get_by_id(doc_id)

            if not doc:
                logger.error("Document not found in database: %s", doc_id)
                return

            try:
                # ── Phase 1: PDF Parsing & Text Block Extraction ──────
                logger.info("[%s] Phase 1: Parsing PDF blocks...", doc_id)
                doc.parsing_status = "processing"
                await uow.session.flush()
                
                # Start parsing progress animation task
                anim_task = asyncio.create_task(animate_progress(doc_id, target_val=25.0, steps=10, interval=0.15))
                try:
                    pages_count, chunks = await asyncio.to_thread(PDFProcessor.extract_pages_and_chunks, file_bytes)
                    await anim_task
                except Exception:
                    anim_task.cancel()
                    raise
                
                # Update page counts and progress
                doc.pages = pages_count
                doc.parsing_status = "completed"
                doc.embedding_status = "processing"
                doc.progress = 25.0
                await uow.session.flush()

                # Start embedding progress animation task
                anim_task = asyncio.create_task(animate_progress(doc_id, target_val=50.0, steps=15, interval=0.15))
                try:
                    # ── Phase 2: Compute Embeddings & Save Chunks ──────────
                    logger.info("[%s] Phase 2: Generating vector embeddings for %d chunks...", doc_id, len(chunks))
                    if chunks:
                        chunk_texts = [c["text"] for c in chunks]
                        embeddings = await asyncio.to_thread(embeddings_service.get_embeddings, chunk_texts)
                        
                        chunk_models = [
                            DocumentChunk(
                                document_id=doc_id,
                                page=chunk["page"],
                                paragraph=chunk["paragraph"],
                                text=chunk["text"],
                                embedding=embeddings[idx],
                            )
                            for idx, chunk in enumerate(chunks)
                        ]
                        uow.session.add_all(chunk_models)
                    await anim_task
                except Exception:
                    anim_task.cancel()
                    raise
                
                # Complete Stage 1: Document is now ready for Chat & Reading
                doc.embedding_status = "completed"
                doc.status = "ready"
                doc.progress = 50.0
                
                # Commit database additions so user can interact immediately
                await uow.commit()
                logger.info("[%s] Stage 1 complete: Document ready for AI chat.", doc_id)

                # ── Phase 3-6: Dispatch AI tasks to background worker chain ─────
                asyncio.create_task(run_background_pipeline_chain(doc_id, chunks))

            except Exception as exc:
                logger.exception("[%s] Critical failure in document processing pipeline", doc_id)
                doc.status = "failed"
                doc.parsing_status = "failed"
                doc.embedding_status = "failed"
                doc.progress = 100.0
                await uow.commit()
