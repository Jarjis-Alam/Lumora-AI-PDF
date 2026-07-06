"""create_core_models

Revision ID: cac7f774d5e1
Revises: 
Create Date: 2026-07-05 19:46:58.820335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cac7f774d5e1'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create documents table
    op.create_table(
        'documents',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('uploaded_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('last_opened_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('pages', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('progress', sa.Float(), nullable=False),
        sa.Column('size', sa.Integer(), nullable=False),
        sa.Column('accent', sa.String(), nullable=False),
        sa.Column('summary', sa.JSON(), nullable=True),
        sa.Column('graph', sa.JSON(), nullable=True),
        sa.Column('bookmarks', sa.JSON(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)

    # 2. Create flashcards table
    op.create_table(
        'flashcards',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('front', sa.String(), nullable=False),
        sa.Column('back', sa.String(), nullable=False),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_flashcards_document_id'), 'flashcards', ['document_id'], unique=False)

    # 3. Create quiz_questions table
    op.create_table(
        'quiz_questions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('question', sa.String(), nullable=False),
        sa.Column('answer', sa.String(), nullable=False),
        sa.Column('explanation', sa.String(), nullable=False),
        sa.Column('difficulty', sa.String(), nullable=False),
        sa.Column('options', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_questions_document_id'), 'quiz_questions', ['document_id'], unique=False)

    # 4. Create chat_messages table
    op.create_table(
        'chat_messages',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('document_id', sa.String(), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('citations', sa.JSON(), nullable=True),
        sa.ForeignKeyConstraint(['document_id'], ['documents.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chat_messages_document_id'), 'chat_messages', ['document_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_chat_messages_document_id'), table_name='chat_messages')
    op.drop_table('chat_messages')
    op.drop_index(op.f('ix_quiz_questions_document_id'), table_name='quiz_questions')
    op.drop_table('quiz_questions')
    op.drop_index(op.f('ix_flashcards_document_id'), table_name='flashcards')
    op.drop_table('flashcards')
    op.drop_index(op.f('ix_documents_id'), table_name='documents')
    op.drop_table('documents')

