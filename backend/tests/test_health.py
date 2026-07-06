"""
Tests for the /health endpoint.
"""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.main import create_app


@pytest.mark.asyncio
async def test_health_check_success(client: AsyncClient):
    """Test health check returns 200 and healthy status when DB is reachable."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"
    assert "version" in data
    assert "environment" in data


@pytest.mark.asyncio
async def test_health_check_db_failure():
    """Test health check returns degraded status when database query fails."""
    app = create_app()

    # Define a database dependency that returns a session that fails on execute
    class FailingSession:
        async def execute(self, statement, *args, **kwargs):
            raise Exception("Connection Refused")

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

    async def broken_db():
        yield FailingSession()

    app.dependency_overrides[get_db] = broken_db

    from httpx import ASGITransport
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/health")

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "degraded"
    assert data["database"] == "disconnected"

