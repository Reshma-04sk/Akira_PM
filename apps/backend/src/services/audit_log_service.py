from typing import Any
from uuid import UUID

from src.models.audit_log import AuditLog
from src.repositories.audit_log_repository import AuditLogRepository


class AuditLogService:
    def __init__(self, audit_log_repository: AuditLogRepository):
        self.audit_log_repository = audit_log_repository

    async def log_action(
        self,
        user_id: UUID | None,
        action: str,
        entity_type: str | None = None,
        entity_id: str | None = None,
        details: dict[str, Any] | None = None,
    ) -> AuditLog:
        attributes = {
            "user_id": user_id,
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "details": details,
        }
        return await self.audit_log_repository.create(attributes)

    async def get_logs(
        self,
        page: int,
        size: int,
        user_id: UUID | None = None,
        action: str | None = None,
    ) -> tuple[list[AuditLog], int]:
        return await self.audit_log_repository.get_paginated_logs(
            page=page, size=size, user_id=user_id, action=action
        )
