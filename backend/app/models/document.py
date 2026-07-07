"""
SQLAlchemy database models for Document and its related sub-entities.
"""

from datetime import datetime
from typing import Any, Optional

from sqlalchemy import DateTime, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.vector_type import VectorField



class Document(Base):
    """
    Core Document table.
    Stores metadata, state, accent coloring, bookmarks, and complex structured fields
    (summary, knowledge graph) as JSON/JSONB.
    """
    __tablename__ = "documents"

    id: Mapped[str] = mapped_column(String, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    last_opened_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    pages: Mapped[int] = mapped_column(nullable=False, default=0)
    status: Mapped[str] = mapped_column(nullable=False, default="processing")
    progress: Mapped[float] = mapped_column(nullable=False, default=0.0)
    size: Mapped[int] = mapped_column(nullable=False, default=0)
    accent: Mapped[str] = mapped_column(nullable=False, default="#C0392B")

    # Detailed lifecycle statuses
    upload_status: Mapped[str] = mapped_column(String, nullable=False, server_default="completed")
    parsing_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")
    embedding_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")
    summary_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")
    flashcard_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")
    quiz_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")
    graph_status: Mapped[str] = mapped_column(String, nullable=False, server_default="pending")

    # JSON/JSONB columns for nested document schemas
    summary: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    graph: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    bookmarks: Mapped[list[int]] = mapped_column(JSON, nullable=False, default=list)

    # Relationships (with cascade delete enabled)
    flashcards: Mapped[list["Flashcard"]] = relationship(
        "Flashcard",
        back_populates="document",
        cascade="all, delete-orphan",
    )
    quiz_questions: Mapped[list["QuizQuestion"]] = relationship(
        "QuizQuestion",
        back_populates="document",
        cascade="all, delete-orphan",
    )
    chat_messages: Mapped[list["ChatMessage"]] = relationship(
        "ChatMessage",
        back_populates="document",
        cascade="all, delete-orphan",
    )
    chunks: Mapped[list["DocumentChunk"]] = relationship(
        "DocumentChunk",
        back_populates="document",
        cascade="all, delete-orphan",
    )



class Flashcard(Base):
    """
    Flashcard table.
    Contains front/back qa study cards generated from the parent document.
    """
    __tablename__ = "flashcards"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    document_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    front: Mapped[str] = mapped_column(String, nullable=False)
    back: Mapped[str] = mapped_column(String, nullable=False)

    # Back-reference
    document: Mapped["Document"] = relationship("Document", back_populates="flashcards")


class QuizQuestion(Base):
    """
    Quiz question table.
    Contains generated multiple-choice, true/false, or short-answer questions.
    """
    __tablename__ = "quiz_questions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    document_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type: Mapped[str] = mapped_column(String, nullable=False)  # 'mcq' | 'truefalse' | 'short'
    question: Mapped[str] = mapped_column(String, nullable=False)
    answer: Mapped[str] = mapped_column(String, nullable=False)
    explanation: Mapped[str] = mapped_column(String, nullable=False)
    difficulty: Mapped[str] = mapped_column(String, nullable=False)  # 'easy' | 'medium' | 'hard'

    # Options (MCQ choice options list, e.g. ['Choice A', 'Choice B'])
    options: Mapped[Optional[list[str]]] = mapped_column(JSON, nullable=True)

    # Back-reference
    document: Mapped["Document"] = relationship("Document", back_populates="quiz_questions")


class ChatMessage(Base):
    """
    ChatMessage table.
    Contains persistent chat interaction messages and reference citations.
    """
    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    document_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(String, nullable=False)  # 'user' | 'assistant'
    content: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # Citations list (page, paragraph, text)
    citations: Mapped[Optional[list[dict[str, Any]]]] = mapped_column(JSON, nullable=True)

    # Back-reference
    document: Mapped["Document"] = relationship("Document", back_populates="chat_messages")


class DocumentChunk(Base):
    """
    DocumentChunk table.
    Stores the text segments and calculated 384-dimensional vector embeddings
    for semantic retrieval in RAG.
    """
    __tablename__ = "document_chunks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    document_id: Mapped[str] = mapped_column(
        String,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    page: Mapped[int] = mapped_column(nullable=False)
    paragraph: Mapped[int] = mapped_column(nullable=False)
    text: Mapped[str] = mapped_column(String, nullable=False)
    
    # 384-dimensional embedding vector (BAAI/bge-small-en-v1.5)
    embedding: Mapped[list[float]] = mapped_column(VectorField(384), nullable=False)

    # Back-reference
    document: Mapped["Document"] = relationship("Document", back_populates="chunks")

