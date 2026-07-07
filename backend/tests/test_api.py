"""
Integration API tests verifying REST contracts, schema validation, and JSON key structures.
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.models.document import Document, Flashcard, QuizQuestion, ChatMessage, DocumentChunk
from app.main import create_app


@pytest_io_fixture := pytest_asyncio.fixture(scope="function")
async def api_client() -> AsyncClient:
    """
    Spins up a FastAPI test client configured with a local SQLite database.
    """
    from app.core import database
    import os
    
    # Ensure any stale test DB is removed first
    if os.path.exists("testdb.db"):
        try:
            os.remove("testdb.db")
        except Exception:
            pass

    engine = create_async_engine("sqlite+aiosqlite:///testdb.db", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    # Route background workers during tests to the same database
    database.testing_session_factory = async_session_factory

    async def override_get_db():
        async with async_session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    # Clean up globals and engine connection nodes
    database.testing_session_factory = None
    await engine.dispose()

    if os.path.exists("testdb.db"):
        try:
            os.remove("testdb.db")
        except Exception:
            pass



@pytest.mark.asyncio
async def test_document_lifecycle_and_generation(api_client: AsyncClient):
    """Test full document workflow: upload, fetch, rename, generate, custom cards, chat, delete."""
    # 1. Verify list is initially empty
    response = await api_client.get("/api/documents")
    assert response.status_code == 200
    assert response.json() == []

    # 2. Upload document
    files = {"file": ("attention.pdf", b"PDF_DUMMY_CONTENT", "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 201
    doc_data = response.json()
    assert "id" in doc_data
    assert doc_data["name"] == "attention.pdf"
    assert doc_data["status"] == "processing"
    assert doc_data["progress"] == 0.0
    doc_id = doc_data["id"]

    # Verify camelCase keys in payload
    assert "uploadedAt" in doc_data
    assert "lastOpenedAt" in doc_data

    # 3. Rename document
    response = await api_client.patch(f"/api/documents/{doc_id}", json={"name": "renamed_attention.pdf"})
    assert response.status_code == 200
    assert response.json()["name"] == "renamed_attention.pdf"

    # 4. Generate summary
    response = await api_client.post(f"/api/documents/{doc_id}/summary")
    assert response.status_code == 200
    summary_doc = response.json()
    assert summary_doc["summary"] is not None
    assert summary_doc["status"] == "ready"
    assert summary_doc["progress"] == 100.0
    assert "readingTime" in summary_doc["summary"]

    # 5. Generate flashcards
    response = await api_client.post(f"/api/documents/{doc_id}/flashcards")
    assert response.status_code == 200
    flashcards_doc = response.json()
    assert len(flashcards_doc["flashcards"]) > 0
    card_id = flashcards_doc["flashcards"][0]["id"]
    original_front = flashcards_doc["flashcards"][0]["front"]

    # 6. Add custom flashcard
    response = await api_client.post(
        f"/api/documents/{doc_id}/flashcards/add",
        json={"front": "Custom Q", "back": "Custom A"},
    )
    assert response.status_code == 200
    added_doc = response.json()
    # E.g. original length + 1
    assert len(added_doc["flashcards"]) == len(flashcards_doc["flashcards"]) + 1
    custom_card = [c for c in added_doc["flashcards"] if c["front"] == "Custom Q"][0]
    custom_card_id = custom_card["id"]

    # 7. Edit custom flashcard
    response = await api_client.patch(
        f"/api/documents/{doc_id}/flashcards/{custom_card_id}",
        json={"front": "Edited Q", "back": "Edited A"},
    )
    assert response.status_code == 200
    edited_doc = response.json()
    edited_card = [c for c in edited_doc["flashcards"] if c["id"] == custom_card_id][0]
    assert edited_card["front"] == "Edited Q"

    # 8. Delete flashcard
    response = await api_client.delete(f"/api/documents/{doc_id}/flashcards/{custom_card_id}")
    assert response.status_code == 200
    deleted_doc = response.json()
    assert len([c for c in deleted_doc["flashcards"] if c["id"] == custom_card_id]) == 0

    # 9. Generate quiz questions
    response = await api_client.post(f"/api/documents/{doc_id}/quiz")
    assert response.status_code == 200
    quiz_doc = response.json()
    assert len(quiz_doc["quiz"]) > 0
    assert "question" in quiz_doc["quiz"][0]

    # 10. Generate knowledge graph
    response = await api_client.post(f"/api/documents/{doc_id}/graph")
    assert response.status_code == 200
    graph_doc = response.json()
    assert graph_doc["graph"] is not None
    assert len(graph_doc["graph"]["nodes"]) > 0

    # 11. Send Chat Message
    response = await api_client.post(f"/api/documents/{doc_id}/chat", json={"content": "Who is Vaswani?"})
    assert response.status_code == 200
    chat_doc = response.json()
    assert len(chat_doc["chat"]) == 2  # User message + assistant answer message
    assert chat_doc["chat"][0]["role"] == "user"
    assert chat_doc["chat"][1]["role"] == "assistant"
    assert "citations" in chat_doc["chat"][1]

    # 12. Clear chat messages
    response = await api_client.delete(f"/api/documents/{doc_id}/chat")
    assert response.status_code == 200
    cleared_doc = response.json()
    assert len(cleared_doc["chat"]) == 0

    # 13. Delete document
    response = await api_client.delete(f"/api/documents/{doc_id}")
    assert response.status_code == 204

    # Verify list is empty again
    response = await api_client.get("/api/documents")
    assert response.json() == []
