import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AuditLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID | None = None
    user_email: str | None = Field(
        default=None, description="Email of the user who performed the action"
    )
    action: str
    entity_type: str | None = None
    entity_id: str | None = None
    details: dict[str, Any] | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

    @classmethod
    def model_validate(cls, obj: Any, *args: Any, **kwargs: Any) -> "AuditLogResponse":
        instance = super().model_validate(obj, *args, **kwargs)
        if hasattr(obj, "user") and obj.user:
            instance.user_email = obj.user.email
        return instance
