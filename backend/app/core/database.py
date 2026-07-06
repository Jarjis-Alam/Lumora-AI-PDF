"""
Async SQLAlchemy database engine, session factory, and dependency.

Provides:
- Async engine with connection pooling
- Session factory for dependency injection
- get_db() async generator for FastAPI Depends()
- Base declarative class for ORM models
"""

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import get_settings


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def _build_engine():
    """Create the async engine with sensible pool defaults."""
    settings = get_settings()
    return create_async_engine(
        settings.database_url,
        echo=settings.is_development,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,
    )


# Module-level engine and session factory.
# These are created once when the module is first imported.
engine = _build_engine()

async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Reference set by test runner suites to redirect background workers to shared memory engines
testing_session_factory = None



async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that yields an async database session.

    Usage:
        @router.get("/items")
        async def list_items(db: AsyncSession = Depends(get_db)):
            ...
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
