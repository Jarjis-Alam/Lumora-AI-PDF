"""
ChatMessage repository handling history queries and modifications.
"""

from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import delete, select


from app.models.document import ChatMessage
from app.repositories.base import BaseRepository


class ChatMessageRepository(BaseRepository[ChatMessage]):
    """
    Repository for managing ChatMessage logs.
    """

    async def list_by_document(self, doc_id: str) -> list[ChatMessage]:
        """
        List chat messages for a document in chronological order.
        """
        stmt = (
            select(ChatMessage)
            .where(ChatMessage.document_id == doc_id)
            .order_by(ChatMessage.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(
        self,
        doc_id: str,
        msg_id: str,
        role: str,
        content: str,
        citations: Optional[list] = None,
    ) -> ChatMessage:
        """Create a new chat message and associate it with a document."""
        msg = ChatMessage(
            id=msg_id,
            document_id=doc_id,
            role=role,
            content=content,
            citations=citations or [],
            created_at=datetime.now(timezone.utc),
        )
        self.add(msg)

        return msg

    async def clear_chat(self, doc_id: str) -> None:
        """Delete all chat logs associated with a document."""
        stmt = delete(ChatMessage).where(ChatMessage.document_id == doc_id)
        await self.session.execute(stmt)
