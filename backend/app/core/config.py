"""
Application configuration via environment variables.

Uses pydantic-settings to provide type-safe, validated configuration
with automatic .env file loading.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration for the Lumora backend.

    All values are read from environment variables (or a .env file).
    Required variables will cause a startup error if missing.
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://lumora:lumora@localhost:5432/lumora"

    # ── AI ────────────────────────────────────────────────────
    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    enable_local_embeddings: bool = False


    # ── Application ───────────────────────────────────────────
    environment: str = "development"
    log_level: str = "INFO"
    app_version: str = "0.1.0"

    # ── CORS ──────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"

    @property
    def cors_origin_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """
    Cached singleton for application settings.

    Call this instead of constructing Settings() directly so that
    environment variables are read only once per process.
    """
    return Settings()
