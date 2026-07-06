"""
Pytest configuration and fixtures.
"""

import asyncio
from collections.abc import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.main import create_app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for each test case."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Mock/Fake Database session fixture.
    For Milestone 1, we mock the basic query execution so tests don't require
    a running PostgreSQL instance.
    """
    class MockSession:
        async def execute(self, statement, *args, **kwargs):
            class MockResult:
                def all(self):
                    return []
                def scalar(self):
                    return 1
            return MockResult()

        async def commit(self):
            pass

        async def rollback(self):
            pass

        async def close(self):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass

    yield MockSession()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Async client for hitting FastAPI endpoints.
    Overrides `get_db` dependency with our mock session.
    """
    app = create_app()

    # Override the database dependency
    app.dependency_overrides[get_db] = lambda: db_session

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
