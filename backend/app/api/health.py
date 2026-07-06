"""
Health-check endpoint.

Used by deployment platforms (Railway, Render) and monitoring tools
to verify the service is alive and the database is reachable.
"""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.database import get_db
from app.core.logging import get_logger

router = APIRouter(tags=["health"])
logger = get_logger("health")


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Returns service health status including database connectivity.

    Response shape:
        {
            "status": "healthy",
            "database": "connected",
            "version": "0.1.0",
            "environment": "development"
        }
    """
    settings = get_settings()
    db_status = "connected"

    try:
        await db.execute(text("SELECT 1"))
    except Exception as exc:
        logger.error("Database health check failed: %s", exc)
        db_status = "disconnected"

    status = "healthy" if db_status == "connected" else "degraded"

    return {
        "status": status,
        "database": db_status,
        "version": settings.app_version,
        "environment": settings.environment,
    }
