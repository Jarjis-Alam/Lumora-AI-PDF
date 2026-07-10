import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from app.main import create_app

@pytest_asyncio.fixture(scope="function")
async def test_app_client():
    app = create_app()

    # Register mock test endpoints for rate limiting validation
    @app.post("/api/auth/login")
    async def mock_login():
        return {"status": "ok"}

    @app.get("/api/test-limit")
    async def mock_test_limit():
        return {"status": "ok"}

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.mark.asyncio
async def test_login_rate_limiting(test_app_client: AsyncClient):
    """
    Verify login endpoints are limited to 5 attempts per 15 minutes.
    """
    # First 5 attempts should succeed
    for i in range(5):
        response = await test_app_client.post("/api/auth/login")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    # 6th attempt should be blocked with 429 Too Many Requests
    response = await test_app_client.post("/api/auth/login")
    assert response.status_code == 429
    assert "detail" in response.json()
    assert response.json()["detail"] == "Too many requests. Please try again later."
    assert "Retry-After" in response.headers
    assert int(response.headers["Retry-After"]) > 0


@pytest.mark.asyncio
async def test_general_rate_limiting(test_app_client: AsyncClient):
    """
    Verify general endpoints are limited to 60 attempts per 1 minute.
    """
    # First 60 attempts should succeed
    for i in range(60):
        response = await test_app_client.get("/api/test-limit")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}

    # 61st attempt should be blocked with 429 Too Many Requests
    response = await test_app_client.get("/api/test-limit")
    assert response.status_code == 429
    assert "detail" in response.json()
    assert "Retry-After" in response.headers
    assert int(response.headers["Retry-After"]) > 0


@pytest.mark.asyncio
async def test_exempt_endpoints(test_app_client: AsyncClient):
    """
    Verify health checks and internal endpoints are excluded from rate limits.
    """
    # Send 70 requests to /health - should not be rate limited
    for _ in range(70):
        response = await test_app_client.get("/health")
        assert response.status_code == 200
