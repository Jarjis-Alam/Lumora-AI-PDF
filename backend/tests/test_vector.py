"""
Unit tests verifying the dialect-aware VectorField column type decorator
and DocumentChunk database model structures.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.document import Document, DocumentChunk


@pytest.fixture(scope="function")
def sync_db_session():
    """
    Sync in-memory SQLite database session fixture.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_document_chunk_embedding_persistence(sync_db_session):
    """Verify that a 384-dimensional vector embedding list can be saved and retrieved."""
    # 1. Create parent Document
    doc = Document(
        id="doc-vector-1",
        name="test_vector.pdf",
        pages=5,
        status="ready",
        size=1024,
    )
    sync_db_session.add(doc)
    sync_db_session.commit()

    # 2. Generate a 384-dimensional embedding list of floats
    dummy_embedding = [0.123 * (i % 5) - 0.05 * (i % 3) for i in range(384)]
    assert len(dummy_embedding) == 384

    # 3. Create DocumentChunk
    chunk = DocumentChunk(
        document_id="doc-vector-1",
        page=1,
        paragraph=0,
        text="This is a text segment to be semantically indexed.",
        embedding=dummy_embedding,
    )
    sync_db_session.add(chunk)
    sync_db_session.commit()

    # 4. Query back and verify values
    queried_chunk = sync_db_session.query(DocumentChunk).filter_by(document_id="doc-vector-1").first()
    assert queried_chunk is not None
    assert queried_chunk.page == 1
    assert queried_chunk.paragraph == 0
    assert queried_chunk.text == "This is a text segment to be semantically indexed."
    assert len(queried_chunk.embedding) == 384
    assert pytest.approx(queried_chunk.embedding[0]) == dummy_embedding[0]
    assert pytest.approx(queried_chunk.embedding[-1]) == dummy_embedding[-1]

    # Verify Cascade deletion deletes the chunk
    sync_db_session.delete(doc)
    sync_db_session.commit()

    assert sync_db_session.query(Document).filter_by(id="doc-vector-1").first() is None
    assert sync_db_session.query(DocumentChunk).filter_by(document_id="doc-vector-1").first() is None
