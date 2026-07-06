"""
Asynchronous PDF processing pipeline executing text extraction, embedding generation,
and AI asset creation in the background.
"""

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


async def process_document_pipeline(doc_id: str, file_bytes: bytes) -> None:
    """
    Consolidated background task executing PDF parsing, embedding calculation,
    and AI content generations.
    """
    logger.info("Starting processing pipeline for document: %s", doc_id)

    # Initialize dependencies inside task scope
    embeddings_service = EmbeddingsService()
    ai_service = AIService()

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
                pages_count, chunks = PDFProcessor.extract_pages_and_chunks(file_bytes)
                
                # Update page counts and progress
                doc.pages = pages_count
                doc.progress = 10.0
                await uow.session.flush()

                # ── Phase 2: Compute Embeddings & Save Chunks ──────────
                logger.info("[%s] Phase 2: Generating vector embeddings for %d chunks...", doc_id, len(chunks))
                if chunks:
                    chunk_texts = [c["text"] for c in chunks]
                    embeddings = embeddings_service.get_embeddings(chunk_texts)
                    
                    for idx, chunk in enumerate(chunks):
                        vector = embeddings[idx]
                        chunk_model = DocumentChunk(
                            document_id=doc_id,
                            page=chunk["page"],
                            paragraph=chunk["paragraph"],
                            text=chunk["text"],
                            embedding=vector,
                        )
                        uow.session.add(chunk_model)
                
                doc.progress = 50.0
                await uow.session.flush()

                # Gather all text to send to AI services
                full_text = "\n\n".join([c["text"] for c in chunks]) if chunks else ""

                # ── Phase 3: Generate Summary ──────────────────────────
                logger.info("[%s] Phase 3: Generating summary...", doc_id)
                try:
                    summary_data = ai_service.generate_summary(full_text)
                except Exception as exc:
                    logger.warning("[%s] AI summary generation failed, using mock fallback: %s", doc_id, exc)
                    summary_data = make_summary(doc.name, doc.pages)
                
                doc.summary = summary_data
                doc.progress = 70.0
                await uow.session.flush()

                # ── Phase 4: Generate Flashcards ───────────────────────
                logger.info("[%s] Phase 4: Generating recall cards...", doc_id)
                try:
                    cards_data = ai_service.generate_flashcards(full_text)
                    # Fallback to mocks if returned array is empty
                    if not cards_data:
                        raise ValueError("No flashcards returned from AI")
                except Exception as exc:
                    logger.warning("[%s] AI card generation failed, using mock fallback: %s", doc_id, exc)
                    cards_data = make_flashcards(int(time.time()))

                for card in cards_data:
                    card_id = f"fc-{int(time.time() * 1000)}-{hash(card['front']) % 1000}"
                    await uow.flashcards.create(
                        doc_id=doc_id,
                        card_id=card_id,
                        front=card["front"],
                        back=card["back"],
                    )
                
                doc.progress = 85.0
                await uow.session.flush()

                # ── Phase 5: Generate Quiz Questions ───────────────────
                logger.info("[%s] Phase 5: Generating quiz...", doc_id)
                try:
                    quiz_data = ai_service.generate_quiz(full_text)
                    if not quiz_data:
                        raise ValueError("No quiz questions returned from AI")
                except Exception as exc:
                    logger.warning("[%s] AI quiz generation failed, using mock fallback: %s", doc_id, exc)
                    quiz_data = make_quiz(int(time.time()))

                await uow.quizzes.bulk_create(doc_id, quiz_data)
                doc.progress = 95.0
                await uow.session.flush()

                # ── Phase 6: Generate Knowledge Graph ──────────────────
                logger.info("[%s] Phase 6: Generating graph...", doc_id)
                try:
                    graph_data = ai_service.generate_graph(full_text)
                except Exception as exc:
                    logger.warning("[%s] AI graph extraction failed, using mock fallback: %s", doc_id, exc)
                    graph_data = make_graph()

                doc.graph = graph_data
                doc.status = "ready"
                doc.progress = 100.0
                
                # Commit all updates
                await uow.commit()
                logger.info("[%s] Document processing completed successfully", doc_id)

            except Exception as exc:
                logger.exception("[%s] Critical failure in document processing pipeline", doc_id)
                doc.status = "failed"
                doc.progress = 100.0
                await uow.commit()
