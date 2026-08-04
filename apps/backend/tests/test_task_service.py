import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.models.task import TaskPriority, TaskStatus
from src.models.user import UserRole
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.task import TaskCreate, TaskUpdate
from src.services.task_service import TaskService


@pytest.mark.asyncio
async def test_create_and_get_task(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    # Create owner
    owner = await user_repo.create(
        {
            "email": "owner@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    create_data = TaskCreate(
        title="Test Task",
        description="Desc",
        status=TaskStatus.TODO,
        priority=TaskPriority.HIGH,
        project_id=project.id,
    )
    task = await service.create_task(create_data, owner.id)
    assert task.title == "Test Task"
    assert task.project_id == project.id
    assert task.status == TaskStatus.TODO
    assert task.priority == TaskPriority.HIGH

    retrieved = await service.get_task(task.id, owner.id)
    assert retrieved.id == task.id


@pytest.mark.asyncio
async def test_create_task_project_not_found(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    import uuid

    create_data = TaskCreate(
        title="No Project Task",
        project_id=uuid.uuid4(),
    )
    with pytest.raises(NotFoundException):
        await service.create_task(create_data, uuid.uuid4())


@pytest.mark.asyncio
async def test_create_task_not_owner_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner2@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    other = await user_repo.create(
        {
            "email": "other@example.com",
            "hashed_password": "pwd",
            "full_name": "Other",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    create_data = TaskCreate(title="Task", project_id=project.id)
    with pytest.raises(ForbiddenException):
        await service.create_task(create_data, other.id)


@pytest.mark.asyncio
async def test_create_duplicate_task_title_fails(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner3@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    create_data = TaskCreate(title="Duplicate Title", project_id=project.id)
    await service.create_task(create_data, owner.id)

    with pytest.raises(ValidationException):
        await service.create_task(create_data, owner.id)


@pytest.mark.asyncio
async def test_create_task_assignee_validation(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner4@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    import uuid

    create_data = TaskCreate(
        title="Assigned Task",
        project_id=project.id,
        assignee_id=uuid.uuid4(),
    )
    with pytest.raises(ValidationException):
        await service.create_task(create_data, owner.id)


@pytest.mark.asyncio
async def test_update_and_delete_task(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner5@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    task = await service.create_task(
        TaskCreate(title="Original Title", project_id=project.id), owner.id
    )

    # Update
    updated = await service.update_task(
        task.id, TaskUpdate(title="Updated Title"), owner.id
    )
    assert updated.title == "Updated Title"

    # Delete
    await service.delete_task(task.id, owner.id)
    with pytest.raises(NotFoundException):
        await service.get_task(task.id, owner.id)


@pytest.mark.asyncio
async def test_create_task_empty_title_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner_empty@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    with pytest.raises(
        ValidationException, match="Title cannot be empty or whitespace only"
    ):
        await service.create_task(
            TaskCreate(title="   ", project_id=project.id), owner.id
        )


@pytest.mark.asyncio
async def test_create_task_case_insensitive_duplicate_fails(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner_dup@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    await service.create_task(
        TaskCreate(title="Test Task", project_id=project.id), owner.id
    )

    with pytest.raises(ValidationException, match="already exists"):
        await service.create_task(
            TaskCreate(title="test task", project_id=project.id), owner.id
        )


@pytest.mark.asyncio
async def test_create_task_assignee_not_member_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    service = TaskService(task_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner_assignee@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    other = await user_repo.create(
        {
            "email": "other_assignee@example.com",
            "hashed_password": "pwd",
            "full_name": "Other",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Project 1", "owner_id": owner.id})

    # Assigning to non-member/non-owner should fail
    with pytest.raises(
        ValidationException, match="Assignee must be a member of the project"
    ):
        await service.create_task(
            TaskCreate(title="Task", project_id=project.id, assignee_id=other.id),
            owner.id,
        )
