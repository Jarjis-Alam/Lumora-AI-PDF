"""
Unit of Work pattern implementation coordinating multiple repositories.
"""

from collections.abc import AsyncGenerator
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.chat import ChatMessageRepository
from app.repositories.document import DocumentRepository
from app.repositories.flashcard import FlashcardRepository
from app.repositories.quiz import QuizQuestionRepository


class UnitOfWork:
    """
    Coordinates transactions across multiple repositories.
    Uses context manager hooks to auto-rollback on exceptions.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.documents = DocumentRepository(session)
        self.flashcards = FlashcardRepository(session)
        self.quizzes = QuizQuestionRepository(session)
        self.chat = ChatMessageRepository(session)

    async def __aenter__(self) -> "UnitOfWork":
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        if exc_type is not None:
            await self.rollback()
        else:
            # Commit automatically on clean block exit
            await self.commit()

    async def commit(self) -> None:
        """Commit changes to the database."""
        await self.session.commit()
        self.session.expire_all()

    async def rollback(self) -> None:
        """Rollback session transactions."""
        await self.session.rollback()
        self.session.expire_all()



async def get_uow(db: AsyncSession = Depends(get_db)) -> AsyncGenerator[UnitOfWork, None]:
    """
    FastAPI dependency yielding a UnitOfWork scoped to the request lifetime.
    """
    async with UnitOfWork(db) as uow:
        yield uow
