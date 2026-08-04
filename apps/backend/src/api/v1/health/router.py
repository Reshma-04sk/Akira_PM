import logging

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import AppException
from src.core.redis import redis_cache
from src.dependencies.database import get_db_session
from src.schemas.response import APIResponse

router = APIRouter()
logger = logging.getLogger("saas_backend")


@router.get("", response_model=APIResponse[dict[str, str]])
async def check_health(
    db: AsyncSession = Depends(get_db_session),
) -> APIResponse[dict[str, str]]:
    """
    Validates api readiness and database connectivity.
    Used by load balancers and container orchestrators for status checks.
    """
    db_connected = False
    redis_connected = "not_configured"

    try:
        # Verify active database engine connectivity
        await db.execute(text("SELECT 1"))
        db_connected = True
    except Exception as e:
        logger.error("Health probe failed to connect to database: %s", str(e))
        raise AppException(message="Database connection failed", status_code=503) from e

    # Verify Redis connection pool if set
    if redis_cache.redis_pool:
        try:
            async with await redis_cache.get_client() as client:
                await client.ping()
            redis_connected = "connected"
        except Exception as e:
            logger.error("Health probe failed to connect to Redis: %s", str(e))
            raise AppException(
                message="Redis cache connection failed", status_code=503
            ) from e

    return APIResponse(
        data={
            "status": "ok",
            "database": "connected" if db_connected else "disconnected",
            "redis": redis_connected,
        }
    )
