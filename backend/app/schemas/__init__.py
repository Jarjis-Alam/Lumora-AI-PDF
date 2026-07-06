"""
Schemas package exports.
"""

from app.schemas.document import (
    BaseSchema,
    Citation,
    ChatMessage,
    ChatMessageCreate,
    SummarySection,
    DocSummary,
    Flashcard,
    FlashcardCreate,
    FlashcardUpdate,
    QuizQuestion,
    GraphNode,
    GraphEdge,
    KnowledgeGraph,
    Document,
)

__all__ = [
    "BaseSchema",
    "Citation",
    "ChatMessage",
    "ChatMessageCreate",
    "SummarySection",
    "DocSummary",
    "Flashcard",
    "FlashcardCreate",
    "FlashcardUpdate",
    "QuizQuestion",
    "GraphNode",
    "GraphEdge",
    "KnowledgeGraph",
    "Document",
]
