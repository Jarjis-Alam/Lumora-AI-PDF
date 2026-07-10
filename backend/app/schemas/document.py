"""
Pydantic schemas for request validation and response serialization.
Translates Python snake_case variables to JS camelCase properties automatically.
"""

import re
from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, Field, field_serializer, field_validator
from pydantic.alias_generators import to_camel


class BaseSchema(BaseModel):
    """Base schema configured to map and generate camelCase JSON variables."""
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )


class Citation(BaseSchema):
    page: int
    paragraph: int
    text: str


class ChatMessage(BaseSchema):
    id: str
    role: str  # 'user' | 'assistant'
    content: str
    citations: Optional[list[Citation]] = None
    created_at: datetime

    @field_serializer("created_at")
    def serialize_created_at(self, dt: datetime) -> int:
        return int(dt.timestamp() * 1000)


class ChatMessageCreate(BaseSchema):
    content: str

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        from app.utils.sanitization import sanitize_text
        try:
            return sanitize_text(v, max_length=4000, field_name="content")
        except ValueError as exc:
            raise ValueError(str(exc))


class DocumentRename(BaseSchema):
    name: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        from app.utils.sanitization import sanitize_filename
        try:
            return sanitize_filename(v, max_length=100)
        except ValueError as exc:
            raise ValueError(str(exc))


class SummarySection(BaseSchema):
    heading: str
    body: str


class DocSummary(BaseSchema):
    overall: str
    reading_time: int
    chapters: list[SummarySection]
    key_takeaways: list[str]
    concepts: list[dict[str, str]]
    bullet_summary: list[str]


class Flashcard(BaseSchema):
    id: str
    front: str
    back: str


class FlashcardCreate(BaseSchema):
    front: str
    back: str

    @field_validator("front")
    @classmethod
    def validate_front(cls, v: str) -> str:
        from app.utils.sanitization import sanitize_text
        try:
            return sanitize_text(v, max_length=500, field_name="front")
        except ValueError as exc:
            raise ValueError(str(exc))

    @field_validator("back")
    @classmethod
    def validate_back(cls, v: str) -> str:
        from app.utils.sanitization import sanitize_text
        try:
            return sanitize_text(v, max_length=2000, field_name="back")
        except ValueError as exc:
            raise ValueError(str(exc))


class FlashcardUpdate(BaseSchema):
    front: Optional[str] = None
    back: Optional[str] = None

    @field_validator("front")
    @classmethod
    def validate_front(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        from app.utils.sanitization import sanitize_text
        try:
            return sanitize_text(v, max_length=500, field_name="front")
        except ValueError as exc:
            raise ValueError(str(exc))

    @field_validator("back")
    @classmethod
    def validate_back(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        from app.utils.sanitization import sanitize_text
        try:
            return sanitize_text(v, max_length=2000, field_name="back")
        except ValueError as exc:
            raise ValueError(str(exc))


class QuizQuestion(BaseSchema):
    id: str
    type: str  # 'mcq' | 'truefalse' | 'short'
    question: str
    options: Optional[list[str]] = None
    answer: str
    explanation: str
    difficulty: str  # 'easy' | 'medium' | 'hard'


class GraphNode(BaseSchema):
    id: str
    label: str
    type: str  # 'concept' | 'entity' | 'topic'
    page: int
    paragraph: int


class GraphEdge(BaseSchema):
    id: str
    source: str
    target: str
    label: Optional[str] = None


class KnowledgeGraph(BaseSchema):
    nodes: list[GraphNode]
    edges: list[GraphEdge]


class Document(BaseSchema):
    id: str
    name: str
    uploaded_at: datetime
    last_opened_at: Optional[datetime] = None
    pages: int
    status: str  # 'processing' | 'ready' | 'error'
    progress: float
    size: int
    accent: str
    summary: Optional[DocSummary] = None
    flashcards: list[Flashcard] = Field(default_factory=list)
    quiz: list[QuizQuestion] = Field(default_factory=list, validation_alias="quiz_questions")
    graph: Optional[KnowledgeGraph] = None
    chat: list[ChatMessage] = Field(default_factory=list, validation_alias="chat_messages")
    bookmarks: list[int] = Field(default_factory=list)

    @field_serializer("uploaded_at")
    def serialize_uploaded_at(self, dt: datetime) -> int:
        return int(dt.timestamp() * 1000)

    @field_serializer("last_opened_at")
    def serialize_last_opened_at(self, dt: Optional[datetime]) -> Optional[int]:
        if dt is None:
            return None
        return int(dt.timestamp() * 1000)
