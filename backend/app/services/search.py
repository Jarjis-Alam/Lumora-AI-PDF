"""
Semantic search service matching queries to document chunks via cosine similarity.
Supports native pgvector SQL queries on PostgreSQL and in-memory fallback on SQLite.
"""

from sqlalchemy import select

from app.models.document import DocumentChunk
from app.repositories.uow import UnitOfWork
from app.services.embeddings import EmbeddingsService


class SemanticSearchService:
    """
    Executes vector cosine similarity search over a document's chunks.
    """

    def __init__(self, embeddings_service: EmbeddingsService):
        self.embeddings = embeddings_service

    async def search(
        self,
        uow: UnitOfWork,
        doc_id: str,
        query: str,
        limit: int = 5,
    ) -> list[DocumentChunk]:
        """
        Search for document chunks matching the query.
        Uses native pgvector distance sorting in PostgreSQL,
        and falls back to in-memory cosine dot-products in other dialects.
        """
        # 1. Compute the query vector embedding
        query_embedding = self.embeddings.get_embedding(query)

        # 2. Check dialect name
        bind = uow.session.bind
        if bind and bind.dialect.name == "postgresql":
            # PostgreSQL: Run native SQL HNSW/IVFFlat index search using cosine distance (<=>)
            stmt = (
                select(DocumentChunk)
                .where(DocumentChunk.document_id == doc_id)
                .order_by(DocumentChunk.embedding.cosine_distance(query_embedding))
                .limit(limit)
            )
            result = await uow.session.execute(stmt)
            return list(result.scalars().all())
        else:
            # Fallback (SQLite): Load document chunks and calculate similarity in Python
            stmt = select(DocumentChunk).where(DocumentChunk.document_id == doc_id)
            result = await uow.session.execute(stmt)
            chunks = list(result.scalars().all())

            # Dot product calculation (valid since vectors are unit-normalized in EmbeddingsService)
            scored = []
            for chunk in chunks:
                if not chunk.embedding:
                    continue
                # Calculate dot product
                similarity = sum(x * y for x, y in zip(chunk.embedding, query_embedding))
                scored.append((similarity, chunk))

            # Sort descending by similarity
            scored.sort(key=lambda item: item[0], reverse=True)
            return [chunk for _, chunk in scored[:limit]]
