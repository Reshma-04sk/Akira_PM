import logging
import time
from collections import defaultdict

from fastapi import Request

from src.core.exceptions import AppException
from src.core.redis import redis_cache

logger = logging.getLogger("saas_backend")

# In-memory sliding window rate limiter fallback
_in_memory_timestamps = defaultdict(list)


def rate_limit(limit: int = 5, window_seconds: int = 60):
    """
    FastAPI dependency factory that returns a rate limiting dependency.
    Tracks requests by client IP address. Uses Redis if available,
    falling back to in-memory sliding window tracking.
    """
    async def dependency(request: Request) -> None:
        from src.core.settings import settings
        if settings.ENV_STATE == "testing":
            return

        client_ip = request.client.host if request.client else "unknown"
        identifier = f"rate_limit:{request.url.path}:{client_ip}"

        client = await redis_cache.get_client()
        if client:
            try:
                async with client:
                    current = await client.get(identifier)
                    if current and int(current) >= limit:
                        raise AppException(
                            "Rate limit exceeded. Please try again shortly.",
                            status_code=429,
                        )

                    pipe = client.pipeline()
                    await pipe.incr(identifier)
                    await pipe.expire(identifier, window_seconds)
                    await pipe.execute()
                    return
            except AppException:
                raise
            except Exception as e:
                logger.warning(
                    "Redis rate limit fetch failed, falling back to memory: %s", e
                )

        # Thread-safe in-memory sliding window fallback
        now = time.time()
        # Keep only timestamps within the window
        history = [t for t in _in_memory_timestamps[identifier] if now - t < window_seconds]

        if len(history) >= limit:
            _in_memory_timestamps[identifier] = history
            raise AppException(
                "Rate limit exceeded. Please try again shortly.",
                status_code=429,
            )

        history.append(now)
        _in_memory_timestamps[identifier] = history

        # Periodically prune empty/expired keys to prevent memory leaks (5% chance per request)
        import random
        if random.random() < 0.05:
            for key in list(_in_memory_timestamps.keys()):
                active = [t for t in _in_memory_timestamps[key] if now - t < window_seconds]
                if not active:
                    _in_memory_timestamps.pop(key, None)
                else:
                    _in_memory_timestamps[key] = active

    return dependency
