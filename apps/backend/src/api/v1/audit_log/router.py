import math

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.audit_log_repository import AuditLogRepository
from src.schemas.audit_log import AuditLogResponse
from src.schemas.response import PaginatedResponse, PaginationMetadata
from src.services.audit_log_service import AuditLogService

router = APIRouter()


def get_audit_log_service(
    db: AsyncSession = Depends(get_db_session),
) -> AuditLogService:
    repo = AuditLogRepository(db)
    return AuditLogService(repo)


@router.get("", response_model=PaginatedResponse[AuditLogResponse])
async def get_my_audit_logs(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=10, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    service: AuditLogService = Depends(get_audit_log_service),
) -> PaginatedResponse[AuditLogResponse]:
    """
    Retrieves a paginated list of audit logs associated with the current user.
    """
    items, total = await service.get_logs(page=page, size=size, user_id=current_user.id)

    pages = math.ceil(total / size) if total > 0 else 1

    # Validate instances and resolve fields
    serialized_items = [AuditLogResponse.model_validate(item) for item in items]

    return PaginatedResponse(
        data=serialized_items,
        pagination=PaginationMetadata(total=total, page=page, size=size, pages=pages),
    )
