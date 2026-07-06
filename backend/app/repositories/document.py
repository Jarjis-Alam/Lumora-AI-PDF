"""
Document repository handling metadata, status, progress updates, and relationship loads.
"""

from typing import Optional
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.document import Document
from app.repositories.base import BaseRepository


class DocumentRepository(BaseRepository[Document]):
    """
    Repository for managing Document entities.
    """

    async def get_by_id(self, doc_id: str, load_relationships: bool = True) -> Optional[Document]:
        """
        Retrieve a single document by its ID.
        Eagerly loads related collections (flashcards, quizzes, chat) to avoid lazy loading issues.
        """
        stmt = select(Document).where(Document.id == doc_id)
        if load_relationships:
            stmt = stmt.options(
                selectinload(Document.flashcards),
                selectinload(Document.quiz_questions),
                selectinload(Document.chat_messages),
            )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Document]:
        """
        List all documents, ordered by upload time (newest first).
        """
        stmt = (
            select(Document)
            .order_by(Document.uploaded_at.desc())
            .options(
                selectinload(Document.flashcards),
                selectinload(Document.quiz_questions),
                selectinload(Document.chat_messages),
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update_status(self, doc_id: str, status: str, progress: float) -> Optional[Document]:
        """
        Update the processing status and progress percentage of a document.
        """
        doc = await self.get_by_id(doc_id, load_relationships=False)
        if doc:
            doc.status = status
            doc.progress = progress
            self.add(doc)
        return doc

    async def update_metadata(self, doc_id: str, **kwargs) -> Optional[Document]:
        """
        Dynamically update specific fields on the Document metadata.
        Example: rename name, update last opened, or update accent/bookmarks.
        """
        doc = await self.get_by_id(doc_id, load_relationships=False)
        if doc:
            for key, value in kwargs.items():
                if hasattr(doc, key):
                    setattr(doc, key, value)
            self.add(doc)
        return doc
