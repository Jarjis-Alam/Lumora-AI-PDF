"""
Flashcard repository handling study card additions, edits, and deletions.
"""

from typing import Optional
from sqlalchemy import select

from app.models.document import Flashcard
from app.repositories.base import BaseRepository


class FlashcardRepository(BaseRepository[Flashcard]):
    """
    Repository for managing Flashcard entities.
    """

    async def get_by_id(self, card_id: str) -> Optional[Flashcard]:
        """Retrieve a specific flashcard by its ID."""
        stmt = select(Flashcard).where(Flashcard.id == card_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_document(self, doc_id: str) -> list[Flashcard]:
        """Retrieve all flashcards associated with a document."""
        stmt = select(Flashcard).where(Flashcard.document_id == doc_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, doc_id: str, card_id: str, front: str, back: str) -> Flashcard:
        """Create a new flashcard and add it to the tracking session."""
        card = Flashcard(id=card_id, document_id=doc_id, front=front, back=back)
        self.add(card)
        return card

    async def update(self, card_id: str, **kwargs) -> Optional[Flashcard]:
        """Update fields of a specific flashcard (e.g. editing front or back text)."""
        card = await self.get_by_id(card_id)
        if card:
            for key, value in kwargs.items():
                if hasattr(card, key):
                    setattr(card, key, value)
            self.add(card)
        return card

    async def delete_by_id(self, card_id: str) -> bool:
        """Delete a specific flashcard from the database."""
        card = await self.get_by_id(card_id)
        if card:
            await self.delete(card)
            return True
        return False
