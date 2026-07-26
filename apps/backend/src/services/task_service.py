import logging
from uuid import UUID

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.repositories.audit_log_repository import AuditLogRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.task import (
    TaskCreate,
    TaskListResponse,
    TaskResponse,
    TaskUpdate,
)

logger = logging.getLogger("saas_backend")


class TaskService:
    def __init__(
        self,
        task_repository: TaskRepository,
        project_repository: ProjectRepository,
        user_repository: UserRepository,
        audit_log_repository: AuditLogRepository | None = None,
    ):
        self.task_repository = task_repository
        self.project_repository = project_repository
        self.user_repository = user_repository
        self.audit_log_repository = audit_log_repository

    async def create_task(
        self, data: TaskCreate, user_id: UUID
    ) -> TaskResponse:
        # A task must belong to an existing project
        project = await self.project_repository.get_by_id(data.project_id)
        if not project:
            raise NotFoundException("Project not found")

        # Only project owners can create tasks
        if project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to create tasks for this project"
            )

        # Prevent duplicate active task titles within same project
        if await self.task_repository.exists_by_title_for_project(
            data.title, data.project_id
        ):
            raise ValidationException(
                f"A task titled '{data.title}' already exists in this project"
            )

        # Verify assignee exists before assignment
        if data.assignee_id:
            assignee = await self.user_repository.get_by_id(data.assignee_id)
            if not assignee:
                raise ValidationException("Assignee user does not exist")

        task_attributes = {
            "title": data.title.strip(),
            "description": data.description,
            "status": data.status,
            "priority": data.priority,
            "due_date": data.due_date,
            "project_id": data.project_id,
            "assignee_id": data.assignee_id,
        }
        task = await self.task_repository.create(task_attributes)
        logger.info("New task created successfully: %s", task.id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "task_create",
                    "entity_type": "task",
                    "entity_id": str(task.id),
                    "details": {
                        "title": task.title,
                        "project_id": str(project.id),
                    },
                }
            )

        if task.assignee_id:
            try:
                from src.models.notification import NotificationType
                from src.repositories.notification_repository import (
                    NotificationRepository,
                )
                n_repo = NotificationRepository(self.task_repository.session)
                await n_repo.create(
                    {
                        "user_id": task.assignee_id,
                        "type": NotificationType.TASK_ASSIGNED,
                        "title": "Task Assigned",
                        "message": (
                            f"You have been assigned to the task: {task.title}"
                        ),
                        "is_read": False,
                    }
                )
            except Exception as e:
                logger.error(
                    "Failed to create task assignment notification: %s", e
                )

        return TaskResponse.model_validate(task)

    async def get_task(self, task_id: UUID, user_id: UUID) -> TaskResponse:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        # Only project owner can access tasks
        project = await self.project_repository.get_by_id(task.project_id)
        if not project or project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to access this task"
            )

        return TaskResponse.model_validate(task)

    async def list_tasks(
        self,
        *,
        project_id: UUID,
        user_id: UUID,
        assignee_id: UUID | None = None,
        status: str | None = None,
        priority: str | None = None,
        search: str | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> TaskListResponse:
        # Check project exists and user is owner
        project = await self.project_repository.get_by_id(project_id)
        if not project:
            raise NotFoundException("Project not found")

        if project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to list tasks for this project"
            )

        items, total = await self.task_repository.list_tasks(
            project_id=project_id,
            assignee_id=assignee_id,
            status=status,
            priority=priority,
            search=search,
            page=page,
            page_size=page_size,
        )

        return TaskListResponse(
            items=[TaskResponse.model_validate(t) for t in items],
            total=total,
            page=page,
            page_size=page_size,
        )

    async def update_task(
        self, task_id: UUID, data: TaskUpdate, user_id: UUID
    ) -> TaskResponse:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        project = await self.project_repository.get_by_id(task.project_id)
        if not project or project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to update this task"
            )

        update_attrs = {}

        # If title is updated, check for duplicate title in project
        if data.title is not None:
            new_title = data.title.strip()
            if new_title != task.title:
                if await self.task_repository.exists_by_title_for_project(
                    new_title, task.project_id
                ):
                    raise ValidationException(
                        f"A task titled '{new_title}' "
                        "already exists in this project"
                    )
                update_attrs["title"] = new_title

        if data.description is not None:
            update_attrs["description"] = data.description

        if data.status is not None:
            update_attrs["status"] = data.status

        if data.priority is not None:
            update_attrs["priority"] = data.priority

        if data.due_date is not None:
            update_attrs["due_date"] = data.due_date

        if data.assignee_id is not None:
            if data.assignee_id:
                assignee = await self.user_repository.get_by_id(
                    data.assignee_id
                )
                if not assignee:
                    raise ValidationException("Assignee user does not exist")
            update_attrs["assignee_id"] = data.assignee_id

        # Perform update
        if update_attrs:
            old_assignee = task.assignee_id
            task = await self.task_repository.update(task, update_attrs)
            logger.info("Task updated successfully: %s", task.id)

            if self.audit_log_repository:
                await self.audit_log_repository.create(
                    {
                        "user_id": user_id,
                        "action": "task_update",
                        "entity_type": "task",
                        "entity_id": str(task.id),
                        "details": update_attrs,
                    }
                )

            # Trigger Notification
            try:
                from src.models.notification import NotificationType
                from src.repositories.notification_repository import (
                    NotificationRepository,
                )

                n_repo = NotificationRepository(self.task_repository.session)

                if (
                    "assignee_id" in update_attrs
                    and task.assignee_id
                    and task.assignee_id != old_assignee
                ):
                    await n_repo.create(
                        {
                            "user_id": task.assignee_id,
                            "type": NotificationType.TASK_ASSIGNED,
                            "title": "Task Assigned",
                            "message": (
                                f"You have been assigned to the task: {task.title}"
                            ),
                            "is_read": False,
                        }
                    )
                elif task.assignee_id and task.assignee_id != user_id:
                    await n_repo.create(
                        {
                            "user_id": task.assignee_id,
                            "type": NotificationType.TASK_UPDATED,
                            "title": "Task Updated",
                            "message": (
                                f"The task '{task.title}' has been updated."
                            ),
                            "is_read": False,
                        }
                    )
            except Exception as e:
                logger.error("Failed to create task update notification: %s", e)

        return TaskResponse.model_validate(task)

    async def delete_task(self, task_id: UUID, user_id: UUID) -> None:
        task = await self.task_repository.get_by_id(task_id)
        if not task:
            raise NotFoundException("Task not found")

        project = await self.project_repository.get_by_id(task.project_id)
        if not project or project.owner_id != user_id:
            raise ForbiddenException(
                "You do not have permission to delete this task"
            )

        await self.task_repository.soft_delete(task)
        logger.info("Task deleted successfully: %s", task.id)

        if self.audit_log_repository:
            await self.audit_log_repository.create(
                {
                    "user_id": user_id,
                    "action": "task_delete",
                    "entity_type": "task",
                    "entity_id": str(task.id),
                    "details": {"deleted": True},
                }
            )
