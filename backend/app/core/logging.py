"""
Structured logging configuration.

- Development: human-readable, coloured output.
- Production:  JSON-formatted lines for log aggregators.
"""

import logging
import sys

from app.core.config import get_settings


def setup_logging() -> None:
    """Configure the root logger based on application settings."""
    settings = get_settings()
    level = getattr(logging, settings.log_level.upper(), logging.INFO)

    # Clear any existing handlers
    root = logging.getLogger()
    root.handlers.clear()

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)

    if settings.is_development:
        fmt = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
        datefmt = "%H:%M:%S"

    else:
        # JSON-ish structured format for production log aggregators
        fmt = '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s","message":"%(message)s"}'
        datefmt = "%Y-%m-%dT%H:%M:%S"

    formatter = logging.Formatter(fmt=fmt, datefmt=datefmt)
    handler.setFormatter(formatter)

    root.setLevel(level)
    root.addHandler(handler)

    # Quieten noisy third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """Get a named logger for a module."""
    return logging.getLogger(f"lumora.{name}")
