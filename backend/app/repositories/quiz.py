"""
Quiz question repository handling additions and grouping list queries.
"""

from sqlalchemy import select

from app.models.document import QuizQuestion
from app.repositories.base import BaseRepository


class QuizQuestionRepository(BaseRepository[QuizQuestion]):
    """
    Repository for managing QuizQuestion entities.
    """

    async def list_by_document(self, doc_id: str) -> list[QuizQuestion]:
        """Retrieve all quiz questions associated with a document."""
        stmt = select(QuizQuestion).where(QuizQuestion.document_id == doc_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def bulk_create(self, doc_id: str, questions: list[dict]) -> list[QuizQuestion]:
        """
        Creates multiple quiz questions associated with a document.
        Input format:
            questions = [
                {
                    "id": "q-1",
                    "type": "mcq",
                    "question": "What is...",
                    "answer": "A",
                    "explanation": "Because...",
                    "difficulty": "medium",
                    "options": ["A", "B", "C"]
                }
            ]
        """
        import time
        import random
        created = []
        for idx, q in enumerate(questions):
            q_id = q.get("id") or f"q-{int(time.time() * 1000)}-{idx}-{random.randint(1000, 9999)}"
            question = QuizQuestion(
                id=q_id,
                document_id=doc_id,
                type=q["type"],
                question=q["question"],
                answer=q["answer"],
                explanation=q["explanation"],
                difficulty=q["difficulty"],
                options=q.get("options"),
            )
            self.add(question)
            created.append(question)
        return created
