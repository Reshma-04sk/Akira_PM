import json
import logging
from typing import Any
from uuid import UUID

import redis.asyncio as aioredis

from src.core.settings import settings

logger = logging.getLogger("saas_backend")


class RedisCache:
    def __init__(self):
        self.redis_pool: aioredis.ConnectionPool | None = None

    def initialize(self) -> None:
        if not settings.REDIS_URL:
            logger.info("REDIS_URL is not set. Caching is disabled.")
            return

        # Initialize the connection pool using the redis url
        # Upstash Redis URLs support rediss:// which is secure ssl connection.
        self.redis_pool = aioredis.ConnectionPool.from_url(
            settings.REDIS_URL,
            max_connections=20,
            decode_responses=True,
        )
        logger.info("Redis connection pool initialized successfully.")

    async def get_client(self) -> aioredis.Redis | None:
        if not self.redis_pool:
            return None
        return aioredis.Redis(connection_pool=self.redis_pool)


redis_cache = RedisCache()


async def get_cached_val(key: str) -> Any | None:
    client = await redis_cache.get_client()
    if not client:
        return None
    try:
        async with client:
            val = await client.get(key)
            if val:
                return json.loads(val)
    except Exception as e:
        logger.warning("Error reading cache key %s: %s", key, e)
    return None


async def set_cached_val(key: str, val: Any, expire_seconds: int = 300) -> None:
    client = await redis_cache.get_client()
    if not client:
        return
    try:
        async with client:
            await client.set(key, json.dumps(val), ex=expire_seconds)
    except Exception as e:
        logger.warning("Error writing cache key %s: %s", key, e)


async def invalidate_dashboard_cache(
    user_ids: list[UUID] | None = None,
    project_ids: list[UUID] | None = None,
) -> None:
    client = await redis_cache.get_client()
    if not client:
        return
    try:
        async with client:
            keys_to_delete = []
            if user_ids:
                for uid in user_ids:
                    keys_to_delete.append(f"dashboard:overview:{uid}")
            if project_ids:
                for pid in project_ids:
                    keys_to_delete.append(f"dashboard:project:{pid}")
            if keys_to_delete:
                await client.delete(*keys_to_delete)
    except Exception as e:
        logger.warning("Error invalidating dashboard cache: %s", e)

