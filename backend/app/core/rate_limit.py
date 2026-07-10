"""
Rate limiting middleware and utility for FastAPI.
Provides in-memory rate limiting based on client IP.
"""

import time
from typing import Dict, List, Tuple
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint


def get_client_ip(request: Request) -> str:
    """Extract client IP addressing behind potential proxies."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    real_ip = request.headers.get("x-real-ip")
    if real_ip:
        return real_ip
    return request.client.host if request.client else "unknown"


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
            limit = 60
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


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    FastAPI Middleware applying rate limits to API routes.
    """
    def __init__(self, app, limiter: RateLimiter = None):
        super().__init__(app)
        self.limiter = limiter or RateLimiter()

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        path = request.url.path

        # Always permit internal paths, Swagger docs, redoc, openapi schema, and health checks
        if path in ("/health", "/docs", "/redoc", "/openapi.json"):
            return await call_next(request)

        ip = get_client_ip(request)
        is_limited, retry_after = self.limiter.is_rate_limited(ip, path)

        if is_limited:
            return JSONResponse(
                status_code=429,
                content={"detail": "Too many requests. Please try again later."},
                headers={"Retry-After": str(retry_after)}
            )

        return await call_next(request)
