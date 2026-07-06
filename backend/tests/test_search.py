"""
Integration tests verifying SemanticSearchService and SQL dialect fallback query sorting.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.models.document import Document, DocumentChunk
from app.repositories.uow import UnitOfWork
from app.services.embeddings import EmbeddingsService
from app.services.search import SemanticSearchService


@pytest_asyncio.fixture(scope="function")
async def search_db_session() -> AsyncSession:
    """Provides a fresh SQLite in-memory database session."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_semantic_search_retrieval(search_db_session: AsyncSession):
    """Test that query matching returns the most semantically relevant chunks."""
    embeddings = EmbeddingsService()
    search_service = SemanticSearchService(embeddings)
    
    async with UnitOfWork(search_db_session) as uow:
        # Create document
        doc = Document(id="doc-search-1", name="search.pdf", pages=10, size=5000)
        uow.documents.add(doc)

        # Create two chunks with distinct topics
        # Chunk A: Cats
        text_a = "Cats are popular domestic pets known for their playfulness and feline characteristics."
        embedding_a = embeddings.get_embedding(text_a)
        chunk_a = DocumentChunk(
            document_id="doc-search-1",
            page=1,
            paragraph=1,
            text=text_a,
            embedding=embedding_a,
        )
        uow.documents.add(chunk_a)

        # Chunk B: Weather
        text_b = "The forecast predicts rain and strong winds across the United Kingdom tomorrow."
        embedding_b = embeddings.get_embedding(text_b)
        chunk_b = DocumentChunk(
            document_id="doc-search-1",
            page=2,
            paragraph=1,
            text=text_b,
            embedding=embedding_b,
        )
        uow.documents.add(chunk_b)

    # Search for feline pets topic
    async with UnitOfWork(search_db_session) as uow:
        results = await search_service.search(uow, "doc-search-1", "feline domestic pets", limit=1)
        assert len(results) == 1
        assert "popular domestic pets" in results[0].text
        assert results[0].page == 1

        # Search for storm weather topic
        results_weather = await search_service.search(uow, "doc-search-1", "stormy weather forecast", limit=1)
        assert len(results_weather) == 1
        assert "rain and strong winds" in results_weather[0].text
        assert results_weather[0].page == 2

        # Verify limit restrictions
        results_all = await search_service.search(uow, "doc-search-1", "any query", limit=1)
        assert len(results_all) == 1
