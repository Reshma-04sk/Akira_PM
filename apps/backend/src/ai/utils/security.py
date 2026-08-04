import logging
import re
import time
from collections import defaultdict

from src.core.exceptions import AppException
from src.core.redis import redis_cache

logger = logging.getLogger("saas_backend")

# In-memory sliding window rate limiter fallback
_in_memory_timestamps = defaultdict(list)


def sanitize_input(text: str | None) -> str:
    """
    Sanitizes user input by stripping HTML tags and trimming leading/trailing whitespace.
    """
    if not text:
        return ""
    # Strip HTML tags
    clean = re.sub(r"<[^>]*>", "", text)
    return clean.strip()


def validate_prompt(prompt: str | None) -> None:
    """
    Validates the user prompt. Enforces minimum and maximum character limits.
    """
    if not prompt or not prompt.strip():
        raise AppException("Prompt content cannot be empty", status_code=422)

    if len(prompt) > 8000:
        raise AppException(
            "Prompt size exceeds the maximum limit of 8000 characters.",
            status_code=422,
        )


async def check_rate_limit(
    identifier: str = "global", limit: int = 30, window_seconds: int = 60
) -> None:
    """
    Enforces a rate limit on AI API usage.
    Uses Redis connection if available, falling back to in-memory tracking.

    Args:
        identifier: A unique key for rate-limiting (e.g. user ID or IP).
        limit: Max requests within the window.
        window_seconds: Window size in seconds.
    """
    client = await redis_cache.get_client()
    if client:
        try:
            async with client:
                key = f"ai:rate_limit:{identifier}"
                current = await client.get(key)
                if current and int(current) >= limit:
                    raise AppException(
                        "AI Rate limit exceeded. Please try again shortly.",
                        status_code=429,
                    )

                pipe = client.pipeline()
                await pipe.incr(key)
                await pipe.expire(key, window_seconds)
                await pipe.execute()
                return
        except AppException:
            raise
        except Exception as e:
            logger.warning(
                "Redis rate limit fetch failed, falling back to memory: %s", e
            )

    # In-memory sliding window fallback
    now = time.time()
    history = _in_memory_timestamps[identifier]
    # Filter out timestamps outside window
    history = [t for t in history if now - t < window_seconds]
    _in_memory_timestamps[identifier] = history

    if len(history) >= limit:
        raise AppException(
            "AI Rate limit exceeded. Please try again shortly.", status_code=429
        )

    _in_memory_timestamps[identifier].append(now)
