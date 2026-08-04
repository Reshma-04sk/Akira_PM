import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
)
from src.models.project_member import ProjectRole
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.comment_repository import CommentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.comment import (
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    CommentUpdate,
)

logger = logging.getLogger("saas_backend")


class CommentService:
    def __init__(
        self,
        comment_repository: CommentRepository,
        task_repository: TaskRepository,
        project_repository: ProjectRepository,
        project_member_repository: ProjectMemberRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.comment_repository = comment_repository
        self.task_repository = task_repository
        self.project_repository = project_repository
        self.project_member_repository = project_member_repository
        self.audit_log_repository = audit_log_repository

    async def _verify_project_membership(
        self, project_id: UUID, user_id: UUID
    ) -> ProjectRole | None:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        if project.owner_id == user_id:
            return ProjectRole.OWNER

        membership = await self.project_member_repository.get_membership(
            project_id, user_id
        )
        if not membership:
            raise ForbiddenException(
                "You must be a project member to perform this action"
            )
        return membership.role

    async def create_comment(
        self, data: CommentCreate, user_id: UUID
    ) -> CommentResponse:
        task = await self.task_repository.get_by_id(data.task_id)
        if not task:
            raise NotFoundException("Task not found")

        # Enforce workspace and project comment permissions (Viewer cannot comment)
        from src.dependencies.permissions import check_comment_attach_permission

        await check_comment_attach_permission(
            task.project_id, user_id, self.comment_repository.session
        )

        comment_attrs = {
            "task_id": data.task_id,
            "user_id": user_id,
            "content": data.content,
        }
        comment = await self.comment_repository.create(comment_attrs)
        logger.info("Comment created: %s by user %s", comment.id, user_id)

        # Trigger Mentions and Notification
        import re

        from src.models.notification import NotificationType
        from src.repositories.notification_repository import (
            NotificationRepository,
        )

        # Parse mentions
        mention_matches = re.findall(r"@([a-zA-Z0-9_\-\.\@]+)", data.content)
        mentioned_tokens = {m.lower().strip() for m in mention_matches if m.strip()}
        notified_users = set()

        n_repo = NotificationRepository(self.comment_repository.session)

        if mentioned_tokens:
            try:
                # Fetch project members
                members, _ = await self.project_member_repository.list_members(
                    project_id=task.project_id, page_size=1000
                )

                for m in members:
                    if not m.user or m.user_id == user_id:
                        continue

                    email = m.user.email.lower()
                    email_prefix = email.split("@")[0]
                    full_name_clean = (
                        m.user.full_name.lower().replace(" ", "")
                        if m.user.full_name
                        else ""
                    )
                    full_name_tokens = (
                        {tok.lower() for tok in m.user.full_name.split()}
                        if m.user.full_name
                        else set()
                    )

                    is_mentioned = (
                        email in mentioned_tokens
                        or email_prefix in mentioned_tokens
                        or (full_name_clean and full_name_clean in mentioned_tokens)
                        or any(tok in mentioned_tokens for tok in full_name_tokens)
                    )

                    if is_mentioned and m.user_id not in notified_users:
                        notified_users.add(m.user_id)
                        await n_repo.create(
                            {
                                "user_id": m.user_id,
                                "type": NotificationType.MENTION,
                                "title": "Mentioned in Comment",
                                "message": (
                                    f"You were mentioned in a comment on task '{task.title}'"
                                ),
                                "is_read": False,
                            }
                        )
            except Exception as e:
                logger.error("Failed to process mentions: %s", e)

        # Trigger Notification to task assignee (if they haven't already been notified by mention)
        if (
            task.assignee_id
            and task.assignee_id != user_id
            and task.assignee_id not in notified_users
        ):
            try:
                await n_repo.create(
                    {
                        "user_id": task.assignee_id,
                        "type": NotificationType.COMMENT_ADDED,
                        "title": "New Comment",
                        "message": (f"A new comment was added to task '{task.title}'"),
                        "is_read": False,
                    }
                )
            except Exception as e:
                logger.error("Failed to create comment notification: %s", e)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "comment_create",
                    "entity_type": "comment",
                    "entity_id": str(comment.id),
                    "details": {
                        "task_id": str(data.task_id),
                        "project_id": str(task.project_id),
                    },
                }
            )

        return CommentResponse.model_validate(comment)

    async def update_comment(
        self, comment_id: UUID, data: CommentUpdate, user_id: UUID
    ) -> CommentResponse:
        comment = await self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise NotFoundException("Comment not found")

        # Business Rule: Comment owner may edit
        if comment.user_id != user_id:
            raise ForbiddenException("Only the comment owner can edit this comment")

        # Ensure still project member
        task = await self.task_repository.get_by_id(comment.task_id)
        if not task:
            raise NotFoundException("Task not found")
        await self._verify_project_membership(task.project_id, user_id)

        update_attrs = {"content": data.content}
        comment = await self.comment_repository.update(comment, update_attrs)
        logger.info("Comment updated: %s by user %s", comment.id, user_id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "comment_update",
                    "entity_type": "comment",
                    "entity_id": str(comment.id),
                    "details": {
                        "task_id": str(comment.task_id),
                    },
                }
            )

        return CommentResponse.model_validate(comment)

    async def delete_comment(self, comment_id: UUID, user_id: UUID) -> None:
        comment = await self.comment_repository.get_by_id(comment_id)
        if not comment:
            raise NotFoundException("Comment not found")

        task = await self.task_repository.get_by_id(comment.task_id)
        if not task:
            raise NotFoundException("Task not found")

        # Business Rule: Manager, Owner and comment owner may delete any comment
        role = await self._verify_project_membership(task.project_id, user_id)

        is_allowed = comment.user_id == user_id or role in [
            ProjectRole.OWNER,
            ProjectRole.MANAGER,
        ]
        if not is_allowed:
            raise ForbiddenException(
                "You do not have permission to delete this comment"
            )

        await self.comment_repository.delete(comment)
        logger.info("Comment deleted: %s by user %s", comment.id, user_id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "comment_delete",
                    "entity_type": "comment",
                    "entity_id": str(comment.id),
                    "details": {
                        "task_id": str(comment.task_id),
                    },
                }
            )

    async def list_comments(
        self, task_id: UUID, user_id: UUID, page: int = 1, page_size: int = 20
    ) -> CommentListResponse:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        # Must be a project member to see comments
        await self._verify_project_membership(task.project_id, user_id)

        items, total = await self.comment_repository.list_comments(
            task_id, page, page_size
        )

        return CommentListResponse(
            items=[CommentResponse.model_validate(c) for c in items],
            total=total,
            page=page,
            page_size=page_size,
        )
