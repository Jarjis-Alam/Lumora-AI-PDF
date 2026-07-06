"""
Dialect-aware vector field mapping pgvector.sqlalchemy.Vector in PostgreSQL
and SQLAlchemy JSON in fallback dialects (SQLite).
"""

from typing import Any
from sqlalchemy.types import TypeDecorator
from pgvector.sqlalchemy import Vector


class VectorField(TypeDecorator):
    """
    Custom SQLAlchemy type that resolves to VECTOR in PostgreSQL
    and JSON (for list of floats) in SQLite.
    """
    impl = Vector
    cache_ok = True

    def __init__(self, dim: int):
        super().__init__(dim)
        self.dim = dim

    def load_dialect_impl(self, dialect: Any) -> Any:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Vector(self.dim))
        else:
            # Fallback for SQLite in unit tests
            from sqlalchemy import JSON
            return dialect.type_descriptor(JSON())
