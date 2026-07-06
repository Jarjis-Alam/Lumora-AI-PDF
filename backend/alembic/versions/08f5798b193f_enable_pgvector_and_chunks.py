"""enable_pgvector_and_chunks

Revision ID: 08f5798b193f
Revises: cac7f774d5e1
Create Date: 2026-07-05 19:50:59.484100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '08f5798b193f'
down_revision: Union[str, None] = 'cac7f774d5e1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Enable pgvector extension on PostgreSQL
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"
    
    if is_postgres:
        op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    # 2. Create document_chunks table
    # Import Vector to avoid import errors on non-installed systems, though we have it in requirements.
    from pgvector.sqlalchemy import Vector
    
    op.create_table(
        'document_chunks',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('page', sa.Integer(), nullable=False),
        sa.Column('paragraph', sa.Integer(), nullable=False),
        sa.Column('text', sa.String(), nullable=False),
        # Column definition maps dynamically based on helper decorator VectorField, 
        # but in Alembic upgrade we define PostgreSQL native type Vector(384) directly
        sa.Column('embedding', Vector(384) if is_postgres else sa.JSON(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_document_chunks_document_id'), 'document_chunks', ['document_id'], unique=False)

    # 3. Create HNSW index on PostgreSQL for fast vector cosine similarity search
    if is_postgres:
        op.create_index(
            'ix_document_chunks_embedding_hnsw',
            'document_chunks',
            ['embedding'],
            postgresql_using='hnsw',
            postgresql_ops={'embedding': 'vector_cosine_ops'}
        )


def downgrade() -> None:
    bind = op.get_bind()
    is_postgres = bind.dialect.name == "postgresql"

    if is_postgres:
        op.drop_index('ix_document_chunks_embedding_hnsw', table_name='document_chunks')

    op.drop_index(op.f('ix_document_chunks_document_id'), table_name='document_chunks')
    op.drop_table('document_chunks')

    if is_postgres:
        op.execute("DROP EXTENSION IF EXISTS vector")

