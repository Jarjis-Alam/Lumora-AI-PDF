"""
FastAPI application factory.

The create_app() pattern allows tests to inject different configurations
and avoids module-level side effects.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.health import router as health_router
from app.api.documents import router as documents_router
from app.core.config import get_settings
from app.core.database import engine
from app.core.logging import get_logger, setup_logging

logger = get_logger("main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Startup / shutdown lifecycle.

    - On startup: log config summary, verify DB connection.
    - On shutdown: dispose engine connection pool.
    """
    settings = get_settings()
    logger.info(
        "Lumora backend starting — env=%s, version=%s",
        settings.environment,
        settings.app_version,
    )

    # Quick connectivity check at startup
    try:
        async with engine.connect() as conn:
            await conn.execute(__import__("sqlalchemy").text("SELECT 1"))
        logger.info("Database connection verified")
    except Exception as exc:
        logger.error("Database connection failed at startup: %s", exc)

    yield

    # Shutdown: clean up connection pool
    await engine.dispose()
    logger.info("Lumora backend shut down")


def create_app() -> FastAPI:
    """Build and configure the FastAPI application."""

    # Logging must be configured before anything else
    setup_logging()

    settings = get_settings()

    app = FastAPI(
        title="Lumora API",
        description="AI-powered document intelligence platform",
        version=settings.app_version,
        lifespan=lifespan,
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
    )

    # ── CORS ──────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Rate Limiting ─────────────────────────────────────────
    from app.core.rate_limit import RateLimitMiddleware
    app.add_middleware(RateLimitMiddleware)

    # ── Exception handlers ────────────────────────────────────
    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception):
        logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "type": type(exc).__name__,
            },
        )

    # ── Routers ───────────────────────────────────────────────
    app.include_router(health_router)
    app.include_router(documents_router, prefix="/api")

    return app


# Module-level app instance for `uvicorn app.main:app`
app = create_app()
