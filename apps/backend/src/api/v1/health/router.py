import logging
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from src.dependencies.database import get_db_session
from src.schemas.response import APIResponse
from src.core.exceptions import AppException

router = APIRouter()
logger = logging.getLogger("saas_backend")

@router.get("", response_model=APIResponse[dict[str, str]])
async def check_health(db: AsyncSession = Depends(get_db_session)) -> APIResponse[dict[str, str]]:
    """
    Validates api readiness and database connectivity.
    Used by load balancers and container orchestrators for status checks.
    """
    try:
        # Verify active database engine connectivity
        await db.execute(text("SELECT 1"))
        return APIResponse(data={"status": "ok", "database": "connected"})
    except Exception as e:
        logger.error("Health probe failed to connect to database: %s", str(e))
        raise AppException(
            message="Database connection failed",
            status_code=503
        ) from e
