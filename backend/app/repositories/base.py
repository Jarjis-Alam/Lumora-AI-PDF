"""
Base repository encapsulating shared SQLAlchemy session operations.
"""

from typing import Generic, TypeVar
from sqlalchemy.ext.asyncio import AsyncSession

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """
    Base repository providing boilerplate operations.
    """

    def __init__(self, session: AsyncSession):
        self.session = session

    def add(self, entity: T) -> None:
        """Add an entity to the session tracking."""
        self.session.add(entity)

    async def delete(self, entity: T) -> None:
        """Delete an entity from the database."""
        await self.session.delete(entity)

    async def refresh(self, entity: T) -> None:
        """Refresh the entity attributes from the database."""
        await self.session.refresh(entity)
