"""
Unit tests for core database models and relationships.
"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.document import Document, Flashcard, QuizQuestion, ChatMessage


@pytest.fixture(scope="function")
def sync_db_session():
    """
    Provides a synchronous in-memory SQLite database session.
    Perfect for verifying model definitions, constraints, and cascade delete behavior.
    """
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def test_create_document_with_nested_relations(sync_db_session):
    """Verify documents and cascade operations function correctly."""
    # 1. Create a Document
    doc = Document(
        id="doc-123",
        name="Attention Is All You Need.pdf",
        pages=15,
        status="ready",
        progress=100.0,
        size=102456,
        accent="#4A6FA5",
        summary={"overall": "Introduction to transformer networks", "readingTime": 5},
        graph={"nodes": [{"id": "n1", "label": "Transformer"}], "edges": []},
        bookmarks=[1, 4, 8],
    )
    
    # 2. Add Flashcards
    card = Flashcard(
        id="fc-1",
        front="What is multi-head attention?",
        back="An attention mechanism that runs through multiple projection heads in parallel.",
    )
    doc.flashcards.append(card)
    
    # 3. Add Quiz Questions
    quiz = QuizQuestion(
        id="q-1",
        type="mcq",
        question="Who introduced the Transformer?",
        answer="Vaswani et al.",
        explanation="Introduced in the seminal paper 'Attention Is All You Need' in 2017.",
        difficulty="easy",
        options=["Vaswani et al.", "LeCun et al.", "Bengio et al.", "Goodfellow et al."],
    )
    doc.quiz_questions.append(quiz)
    
    # 4. Add Chat Messages
    msg = ChatMessage(
        id="msg-1",
        role="user",
        content="What is self-attention?",
        citations=[{"page": 3, "paragraph": 2, "text": "Self-attention, sometimes called..."}],
    )
    doc.chat_messages.append(msg)
    
    sync_db_session.add(doc)
    sync_db_session.commit()
    
    # Refresh and query back
    queried_doc = sync_db_session.query(Document).filter_by(id="doc-123").first()
    assert queried_doc is not None
    assert queried_doc.name == "Attention Is All You Need.pdf"
    assert queried_doc.pages == 15
    assert len(queried_doc.flashcards) == 1
    assert queried_doc.flashcards[0].id == "fc-1"
    assert queried_doc.flashcards[0].front == "What is multi-head attention?"
    assert len(queried_doc.quiz_questions) == 1
    assert queried_doc.quiz_questions[0].options == ["Vaswani et al.", "LeCun et al.", "Bengio et al.", "Goodfellow et al."]
    assert len(queried_doc.chat_messages) == 1
    assert queried_doc.chat_messages[0].citations[0]["page"] == 3
    
    # Verify cascade delete
    sync_db_session.delete(queried_doc)
    sync_db_session.commit()
    
    # Ensure all related records are deleted automatically
    assert sync_db_session.query(Document).filter_by(id="doc-123").first() is None
    assert sync_db_session.query(Flashcard).filter_by(id="fc-1").first() is None
    assert sync_db_session.query(QuizQuestion).filter_by(id="q-1").first() is None
    assert sync_db_session.query(ChatMessage).filter_by(id="msg-1").first() is None
