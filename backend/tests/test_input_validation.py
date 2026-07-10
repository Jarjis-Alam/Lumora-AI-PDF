"""
Tests verifying input sanitization, oversized payload rejection, and malformed request handling.
"""

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base, get_db
from app.main import create_app


@pytest_asyncio.fixture(scope="function")
async def api_client() -> AsyncClient:
    """
    Spins up a FastAPI test client configured with a local SQLite database.
    """
    from app.core import database
    import os
    
    if os.path.exists("testdb_val.db"):
        try:
            os.remove("testdb_val.db")
        except Exception:
            pass

    engine = create_async_engine("sqlite+aiosqlite:///testdb_val.db", echo=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

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

    database.testing_session_factory = None
    await engine.dispose()

    if os.path.exists("testdb_val.db"):
        try:
            os.remove("testdb_val.db")
        except Exception:
            pass


@pytest.mark.asyncio
async def test_upload_document_size_and_extension_validation(api_client: AsyncClient):
    # 1. Reject empty file
    files = {"file": ("attention.pdf", b"", "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "File is empty" in response.json()["detail"]

    # 2. Reject non-PDF extension
    files = {"file": ("attention.txt", b"PDF_DUMMY_CONTENT", "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "must be a PDF document" in response.json()["detail"]

    # 3. Reject non-PDF MIME type
    files = {"file": ("attention.pdf", b"PDF_DUMMY_CONTENT", "text/plain")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "Only PDF files are allowed" in response.json()["detail"]

    # 4. Reject malformed PDF (does not start with %PDF or PDF_DUMMY)
    files = {"file": ("attention.pdf", b"INVALID_MAGIC_BYTES", "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "Invalid PDF file structure" in response.json()["detail"]

    # 5. Reject oversized file (25MB limit)
    oversized_content = b"%PDF-1.4" + b"X" * (25 * 1024 * 1024 + 1)
    files = {"file": ("attention.pdf", oversized_content, "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "exceeds maximum limit" in response.json()["detail"]

    # 6. Reject invalid filename (path traversal attempts)
    files = {"file": ("../../attention.pdf", b"PDF_DUMMY_CONTENT", "application/pdf")}
    response = await api_client.post("/api/documents", files=files)
    assert response.status_code == 400
    assert "invalid path characters" in response.json()["detail"]


@pytest.mark.asyncio
async def test_document_rename_validation(api_client: AsyncClient):
    # Upload a document first
    files = {"file": ("attention.pdf", b"PDF_DUMMY_CONTENT", "application/pdf")}
    res = await api_client.post("/api/documents", files=files)
    doc_id = res.json()["id"]

    # 1. Reject empty rename
    response = await api_client.patch(f"/api/documents/{doc_id}", json={"name": ""})
    assert response.status_code == 422

    # 2. Reject oversized name (> 100 characters)
    too_long_name = "a" * 101 + ".pdf"
    response = await api_client.patch(f"/api/documents/{doc_id}", json={"name": too_long_name})
    assert response.status_code == 422

    # 3. Reject rename with path traversal
    response = await api_client.patch(f"/api/documents/{doc_id}", json={"name": "../traversal.pdf"})
    assert response.status_code == 422

    # 4. Strip HTML in name
    response = await api_client.patch(f"/api/documents/{doc_id}", json={"name": "<b>clean_name</b>.pdf"})
    assert response.status_code == 200
    assert response.json()["name"] == "clean_name.pdf"


@pytest.mark.asyncio
async def test_chat_message_validation(api_client: AsyncClient):
    # Upload a document first
    files = {"file": ("attention.pdf", b"PDF_DUMMY_CONTENT", "application/pdf")}
    res = await api_client.post("/api/documents", files=files)
    doc_id = res.json()["id"]

    # 1. Reject empty content
    response = await api_client.post(f"/api/documents/{doc_id}/chat", json={"content": ""})
    assert response.status_code == 422

    # 2. Reject content containing only whitespace/HTML
    response = await api_client.post(f"/api/documents/{doc_id}/chat", json={"content": "   <p> </p>  "})
    assert response.status_code == 422

    # 3. Reject oversized message content (> 4000 characters)
    too_long_msg = "x" * 4001
    response = await api_client.post(f"/api/documents/{doc_id}/chat", json={"content": too_long_msg})
    assert response.status_code == 422

    # 4. Strip HTML from chat content
    response = await api_client.post(f"/api/documents/{doc_id}/chat", json={"content": "Hello <script>alert('xss')</script> world"})
    assert response.status_code == 200
    # The first chat item is user message, check if script tag is stripped
    chat_list = response.json()["chat"]
    user_msg = [m for m in chat_list if m["role"] == "user"][0]
    assert user_msg["content"] == "Hello  world"


@pytest.mark.asyncio
async def test_flashcard_validation(api_client: AsyncClient):
    # Upload a document first
    files = {"file": ("attention.pdf", b"PDF_DUMMY_CONTENT", "application/pdf")}
    res = await api_client.post("/api/documents", files=files)
    doc_id = res.json()["id"]

    # 1. Reject oversized flashcard front (> 500 characters)
    too_long_front = "f" * 501
    response = await api_client.post(
        f"/api/documents/{doc_id}/flashcards/add",
        json={"front": too_long_front, "back": "valid back"}
    )
    assert response.status_code == 422

    # 2. Reject oversized flashcard back (> 2000 characters)
    too_long_back = "b" * 2001
    response = await api_client.post(
        f"/api/documents/{doc_id}/flashcards/add",
        json={"front": "valid front", "back": too_long_back}
    )
    assert response.status_code == 422

    # 3. Strip HTML from flashcard front and back
    response = await api_client.post(
        f"/api/documents/{doc_id}/flashcards/add",
        json={"front": "<b>front</b> text", "back": "<i>back</i> text"}
    )
    assert response.status_code == 200
    doc_data = response.json()
    added_card = [c for c in doc_data["flashcards"] if "front text" in c["front"]][0]
    assert added_card["front"] == "front text"
    assert added_card["back"] == "back text"
