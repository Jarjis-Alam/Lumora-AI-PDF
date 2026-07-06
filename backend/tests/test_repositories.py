"""
Asynchronous repository and Unit of Work integration tests using SQLite in-memory.
"""

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.database import Base
from app.models.document import Document
from app.repositories.uow import UnitOfWork


@pytest_asyncio.fixture(scope="function")
async def async_session() -> AsyncSession:
    """
    Sets up an in-memory async SQLite session for testing repository operations.
    """
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )
    async with async_session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_uow_flow(async_session: AsyncSession):
    """Test a full UoW flow: creating documents, flashcards, and updating statuses."""
    # Initialize UoW
    async with UnitOfWork(async_session) as uow:
        # 1. Create a document
        doc = Document(
            id="doc-999",
            name="paper.pdf",
            pages=20,
            size=500000,
            accent="#ABCDEF",
        )
        uow.documents.add(doc)
        # Verify it's in the session tracking
        assert doc in uow.session.new

    # Auto-commit runs on clean exit. Let's start a new UoW session to verify persistence.
    async with UnitOfWork(async_session) as uow:
        # Query Document back
        fetched_doc = await uow.documents.get_by_id("doc-999")
        assert fetched_doc is not None
        assert fetched_doc.name == "paper.pdf"
        assert fetched_doc.status == "processing"

        # 2. Add a flashcard
        card = await uow.flashcards.create(
            doc_id="doc-999",
            card_id="card-999",
            front="Q",
            back="A",
        )
        assert card.id == "card-999"

        # 3. Update status
        await uow.documents.update_status("doc-999", "ready", 100.0)

    # Verify changes persisted after second commit
    async with UnitOfWork(async_session) as uow:
        fetched_doc = await uow.documents.get_by_id("doc-999")
        assert fetched_doc.status == "ready"
        assert fetched_doc.progress == 100.0
        assert len(fetched_doc.flashcards) == 1
        assert fetched_doc.flashcards[0].front == "Q"

        # 4. Modify flashcard front text
        updated_card = await uow.flashcards.update("card-999", front="New Question")
        assert updated_card.front == "New Question"

    # Verify update persisted
    async with UnitOfWork(async_session) as uow:
        fetched_cards = await uow.flashcards.list_by_document("doc-999")
        assert len(fetched_cards) == 1
        assert fetched_cards[0].front == "New Question"

        # 5. Delete flashcard
        deleted = await uow.flashcards.delete_by_id("card-999")
        assert deleted is True

    # Verify flashcard deletion persisted
    async with UnitOfWork(async_session) as uow:
        fetched_cards = await uow.flashcards.list_by_document("doc-999")
        assert len(fetched_cards) == 0


@pytest.mark.asyncio
async def test_uow_rollback_on_exception(async_session: AsyncSession):
    """Ensure that UoW context manager triggers rollback on exceptions."""
    try:
        async with UnitOfWork(async_session) as uow:
            doc = Document(
                id="doc-fail",
                name="uncommitted.pdf",
                pages=10,
                size=250000,
            )
            uow.documents.add(doc)
            raise ValueError("Intentional crash to trigger rollback")
    except ValueError:
        pass

    # Verify document was not committed
    async with UnitOfWork(async_session) as uow:
        fetched_doc = await uow.documents.get_by_id("doc-fail", load_relationships=False)
        assert fetched_doc is None


@pytest.mark.asyncio
async def test_chat_message_and_clear_chat(async_session: AsyncSession):
    """Test ChatMessageRepository creation and chronological queries."""
    async with UnitOfWork(async_session) as uow:
        # Create document
        doc = Document(
            id="doc-chat",
            name="chat.pdf",
            pages=5,
            size=10000,
        )
        uow.documents.add(doc)

        # Create two messages
        await uow.chat.create("doc-chat", "m1", "user", "Hello")
        await uow.chat.create(
            "doc-chat",
            "m2",
            "assistant",
            "Hi there",
            citations=[{"page": 1, "paragraph": 1, "text": "Citation content"}],
        )

    # Query back and verify order
    async with UnitOfWork(async_session) as uow:
        messages = await uow.chat.list_by_document("doc-chat")
        assert len(messages) == 2
        assert messages[0].id == "m1"
        assert messages[0].role == "user"
        assert messages[1].id == "m2"
        assert messages[1].role == "assistant"
        assert messages[1].citations[0]["page"] == 1

        # Clear chat
        await uow.chat.clear_chat("doc-chat")

    # Verify empty list
    async with UnitOfWork(async_session) as uow:
        messages = await uow.chat.list_by_document("doc-chat")
        assert len(messages) == 0


@pytest.mark.asyncio
async def test_quiz_question_bulk_create_id_generation(async_session: AsyncSession):
    """Test bulk_create on QuizQuestionRepository generates IDs when not provided."""
    async with UnitOfWork(async_session) as uow:
        # Create document
        doc = Document(
            id="doc-quiz",
            name="quiz.pdf",
            pages=5,
            size=10000,
        )
        uow.documents.add(doc)

        questions_payload = [
            {
                "type": "mcq",
                "question": "What is 1+1?",
                "options": ["1", "2", "3"],
                "answer": "2",
                "explanation": "Math",
                "difficulty": "easy"
            },
            {
                "id": "provided-id-99",
                "type": "truefalse",
                "question": "Is the sky blue?",
                "answer": "True",
                "explanation": "Atmosphere physics",
                "difficulty": "easy"
            }
        ]

        created = await uow.quizzes.bulk_create("doc-quiz", questions_payload)
        assert len(created) == 2
        assert created[0].id is not None
        assert created[0].id.startswith("q-")
        assert created[1].id == "provided-id-99"
