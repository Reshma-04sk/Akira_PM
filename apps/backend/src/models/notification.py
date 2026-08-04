import enum
import uuid
from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlalchemy import UUID, Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db.base import Base

if TYPE_CHECKING:
    from src.models.user import User


class NotificationType(enum.StrEnum):
    TASK_ASSIGNED = "task_assigned"
    TASK_UPDATED = "task_updated"
    COMMENT_ADDED = "comment_added"
    PROJECT_INVITE = "project_invite"
    ROLE_CHANGED = "role_changed"
    ATTACHMENT_ADDED = "attachment_added"
    MENTION = "mention"


def utc_now() -> datetime:
    return datetime.now(UTC)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    type: Mapped[NotificationType] = mapped_column(
        SQLEnum(NotificationType, native_enum=False),
        nullable=False,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="notifications")
