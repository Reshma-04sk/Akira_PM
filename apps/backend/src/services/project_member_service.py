import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.models.project import Project
from src.models.project_member import ProjectRole
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.schemas.project_member import (
    ProjectMemberCreate,
    ProjectMemberListResponse,
    ProjectMemberResponse,
    ProjectMemberUpdate,
)

logger = logging.getLogger("saas_backend")


class ProjectMemberService:
    def __init__(
        self,
        project_member_repository: ProjectMemberRepository,
        project_repository: ProjectRepository,
        user_repository: UserRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.project_member_repository = project_member_repository
        self.project_repository = project_repository
        self.user_repository = user_repository
        self.audit_log_repository = audit_log_repository

    async def _get_project_and_verify_membership(
        self, project_id: UUID
    ) -> Project:
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")
        return project

    async def _verify_actor_role(
        self,
        project_id: UUID,
        actor_id: UUID,
        allowed_roles: list[ProjectRole],
    ) -> ProjectRole:
        project = await self._get_project_and_verify_membership(project_id)

        # Ultimate project owner/creator always counts as OWNER
        if project.owner_id == actor_id:
            return ProjectRole.OWNER

        membership = await self.project_member_repository.get_membership(
            project_id, actor_id
        )
        if not membership or membership.role not in allowed_roles:
            raise ForbiddenException(
                "You do not have permission to perform this action"
            )
        return membership.role

    async def add_member(
        self, project_id: UUID, data: ProjectMemberCreate, actor_id: UUID
    ) -> ProjectMemberResponse:
        # Validate project exists
        project = await self._get_project_and_verify_membership(project_id)

        # Only project OWNERS and MANAGERS can add members
        actor_role = await self._verify_actor_role(
            project_id, actor_id, [ProjectRole.OWNER, ProjectRole.MANAGER]
        )

        # Only project OWNERS can assign the OWNER role
        if data.role == ProjectRole.OWNER and actor_role != ProjectRole.OWNER:
            raise ForbiddenException(
                "Only project owners can assign the OWNER role"
            )

        # Validate that invited users exist
        user = await self.user_repository.get_by_id(data.user_id)
        if not user:
            raise NotFoundException("Invited user does not exist")

        # Prevent duplicate memberships
        if await self.project_member_repository.exists(
            project_id, data.user_id
        ):
            raise ValidationException(
                "User is already a member of this project"
            )

        # Create project member record
        member_attrs = {
            "project_id": project_id,
            "user_id": data.user_id,
            "role": data.role,
            "invited_by": actor_id,
        }
        member = await self.project_member_repository.create(member_attrs)
        logger.info(
            "User %s added to project %s with role %s",
            data.user_id,
            project_id,
            data.role,
        )

        # Trigger Notification
        try:
            from src.models.notification import NotificationType
            from src.repositories.notification_repository import (
                NotificationRepository,
            )

            n_repo = NotificationRepository(
                self.project_member_repository.session
            )
            await n_repo.create(
                {
                    "user_id": data.user_id,
                    "type": NotificationType.PROJECT_INVITE,
                    "title": "Project Invitation",
                    "message": (
                        f"You have been invited to the project: {project.name}"
                    ),
                    "is_read": False,
                }
            )
        except Exception as e:
            logger.error("Failed to create project invite notification: %s", e)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": actor_id,
                    "action": "project_member_add",
                    "entity_type": "project_member",
                    "entity_id": str(member.id),
                    "details": {
                        "project_id": str(project_id),
                        "user_id": str(data.user_id),
                        "role": data.role,
                    },
                }
            )

        return ProjectMemberResponse.model_validate(member)

    async def get_member(
        self, project_id: UUID, user_id: UUID, actor_id: UUID
    ) -> ProjectMemberResponse:
        # Validate project exists
        await self._get_project_and_verify_membership(project_id)

        # Actor must be a member of the project to view details
        await self._verify_actor_role(
            project_id,
            actor_id,
            [
                ProjectRole.OWNER,
                ProjectRole.MANAGER,
                ProjectRole.DEVELOPER,
                ProjectRole.VIEWER,
            ],
        )

        member = await self.project_member_repository.get_membership(
            project_id, user_id
        )
        if not member:
            raise NotFoundException("Project member not found")

        return ProjectMemberResponse.model_validate(member)

    async def list_members(
        self,
        *,
        project_id: UUID,
        actor_id: UUID,
        role: ProjectRole | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> ProjectMemberListResponse:
        # Validate project exists
        await self._get_project_and_verify_membership(project_id)

        # Actor must be a member of the project to list members
        await self._verify_actor_role(
            project_id,
            actor_id,
            [
                ProjectRole.OWNER,
                ProjectRole.MANAGER,
                ProjectRole.DEVELOPER,
                ProjectRole.VIEWER,
            ],
        )

        items, total = await self.project_member_repository.list_members(
            project_id=project_id,
            role=role,
            page=page,
            page_size=page_size,
        )

        return ProjectMemberListResponse(
            items=[ProjectMemberResponse.model_validate(m) for m in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_member_role(
        self,
        project_id: UUID,
        user_id: UUID,
        data: ProjectMemberUpdate,
        actor_id: UUID,
    ) -> ProjectMemberResponse:
        # Validate project exists
        await self._get_project_and_verify_membership(project_id)

        # Actor must be OWNER or MANAGER to update roles
        actor_role = await self._verify_actor_role(
            project_id, actor_id, [ProjectRole.OWNER, ProjectRole.MANAGER]
        )

        member = await self.project_member_repository.get_membership(
            project_id, user_id
        )
        if not member:
            raise NotFoundException("Project member not found")

        # Only project OWNERS can assign or remove the OWNER role
        if data.role == ProjectRole.OWNER and actor_role != ProjectRole.OWNER:
            raise ForbiddenException(
                "Only project owners can assign the OWNER role"
            )

        if member.role == ProjectRole.OWNER and data.role != ProjectRole.OWNER:
            if actor_role != ProjectRole.OWNER:
                raise ForbiddenException(
                    "Only project owners can remove the OWNER role"
                )

            # Prevent demoting the last OWNER
            owner_count = (
                await self.project_member_repository.count_project_owners(
                    project_id
                )
            )
            if owner_count <= 1:
                raise ValidationException("Cannot demote the last owner")

        update_attrs = {}
        if data.role is not None:
            update_attrs["role"] = data.role

        if update_attrs:
            member = await self.project_member_repository.update(
                member, update_attrs
            )
            logger.info("Project member role updated: %s", member.id)

            # Trigger Notification
            try:
                from src.models.notification import NotificationType
                from src.repositories.notification_repository import (
                    NotificationRepository,
                )

                n_repo = NotificationRepository(
                    self.project_member_repository.session
                )
                await n_repo.create(
                    {
                        "user_id": user_id,
                        "type": NotificationType.ROLE_CHANGED,
                        "title": "Role Updated",
                        "message": (
                            f"Your role in the project has been updated to {data.role}."
                        ),
                        "is_read": False,
                    }
                )
            except Exception as e:
                logger.error("Failed to create role update notification: %s", e)

            if self.audit_log_repository:
                await self.audit_log_repository.create(
                    {
                        "user_id": actor_id,
                        "action": "project_member_role_update",
                        "entity_type": "project_member",
                        "entity_id": str(member.id),
                        "details": {
                            "project_id": str(project_id),
                            "user_id": str(user_id),
                            "role": data.role,
                        },
                    }
                )

        return ProjectMemberResponse.model_validate(member)

    async def remove_member(
        self, project_id: UUID, user_id: UUID, actor_id: UUID
    ) -> None:
        # Validate project exists
        await self._get_project_and_verify_membership(project_id)

        # Actor must be OWNER or MANAGER to remove members
        actor_role = await self._verify_actor_role(
            project_id, actor_id, [ProjectRole.OWNER, ProjectRole.MANAGER]
        )

        member = await self.project_member_repository.get_membership(
            project_id, user_id
        )
        if not member:
            raise NotFoundException("Project member not found")

        # Only project OWNERS can remove the OWNER role
        if member.role == ProjectRole.OWNER:
            if actor_role != ProjectRole.OWNER:
                raise ForbiddenException(
                    "Only project owners can remove the OWNER role"
                )

            # Prevent removing the last OWNER of a project
            owner_count = (
                await self.project_member_repository.count_project_owners(
                    project_id
                )
            )
            if owner_count <= 1:
                raise ValidationException("Cannot remove the last owner")

        # Managers cannot remove other Managers
        if (
            member.role == ProjectRole.MANAGER
            and actor_role == ProjectRole.MANAGER
        ):
            if user_id != actor_id:
                raise ForbiddenException(
                    "Managers cannot remove other managers from the project"
                )

        await self.project_member_repository.delete(member)
        logger.info("User %s removed from project %s", user_id, project_id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": actor_id,
                    "action": "project_member_remove",
                    "entity_type": "project_member",
                    "entity_id": str(member.id),
                    "details": {
                        "project_id": str(project_id),
                        "user_id": str(user_id),
                    },
                }
            )
