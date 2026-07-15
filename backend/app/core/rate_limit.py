"""
Rate limiting middleware and utility for FastAPI.
Provides in-memory rate limiting based on client IP.

NOTE: Uses pure ASGI middleware instead of BaseHTTPMiddleware to avoid
breaking FastAPI BackgroundTasks (a known Starlette issue).
"""

import time
from typing import Dict, List, Tuple
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.types import ASGIApp, Receive, Scope, Send


def get_client_ip(scope: Scope) -> str:
    """Extract client IP addressing behind potential proxies."""
    headers = dict(scope.get("headers", []))
    
    forwarded = headers.get(b"x-forwarded-for")
    if forwarded:
        return forwarded.decode().split(",")[0].strip()
    real_ip = headers.get(b"x-real-ip")
    if real_ip:
        return real_ip.decode()
    client = scope.get("client")
    return client[0] if client else "unknown"


class RateLimiter:
    """
    Sliding window in-memory rate limiter.
    """
    def __init__(self):
        # Maps key (ip:group) to list of float timestamps
        self.history: Dict[str, List[float]] = {}

    def is_rate_limited(self, ip: str, path: str) -> Tuple[bool, int]:
        """
        Determine if request from IP to path should be limited.
        Returns:
            Tuple[bool, int]: (is_limited, retry_after_seconds)
        """
        now = time.time()

        # Rules config
        if path.startswith("/api/auth") or path.startswith("/api/login"):
            limit = 5
            window = 900  # 15 minutes in seconds
            group = "auth"
        elif path.startswith("/api"):
            limit = 180
            window = 60   # 1 minute in seconds
            group = "api"
        else:
            # Exclude non-API endpoints from rate limiting
            return False, 0

        key = f"{ip}:{group}"

        # Get request history for this key
        if key not in self.history:
            self.history[key] = []

        # Filter out timestamps older than the window duration
        self.history[key] = [t for t in self.history[key] if now - t < window]

        # Check if limit exceeded
        if len(self.history[key]) >= limit:
            oldest_timestamp = self.history[key][0]
            retry_after = int(window - (now - oldest_timestamp))
            return True, max(1, retry_after)

        # Record this request
        self.history[key].append(now)
        return False, 0


class RateLimitMiddleware:
    """
    Pure ASGI middleware applying rate limits to API routes.
    
    Uses raw ASGI protocol instead of BaseHTTPMiddleware to avoid
    breaking FastAPI BackgroundTasks execution.
    """
    def __init__(self, app: ASGIApp, limiter: RateLimiter = None):
        self.app = app
        self.limiter = limiter or RateLimiter()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        path = scope.get("path", "")

        # Always permit internal paths, Swagger docs, redoc, openapi schema, and health checks
        if path in ("/health", "/docs", "/redoc", "/openapi.json"):
            await self.app(scope, receive, send)
            return

        ip = get_client_ip(scope)
        is_limited, retry_after = self.limiter.is_rate_limited(ip, path)

        if is_limited:
            response = JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(retry_after)}
            )
            await response(scope, receive, send)
            return

        await self.app(scope, receive, send)

