import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
)
from src.models.user import UserRole
from src.repositories.comment_repository import CommentRepository
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.comment import CommentCreate, CommentUpdate
from src.services.comment_service import CommentService


@pytest.mark.asyncio
async def test_create_and_get_comment(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    comment_repo = CommentRepository(db_session)
    service = CommentService(comment_repo, task_repo, project_repo, member_repo)

    owner = await user_repo.create(
        {
            "email": "owner_comment@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj 1", "owner_id": owner.id})
    task = await task_repo.create({"title": "Task 1", "project_id": project.id})

    create_data = CommentCreate(task_id=task.id, content="This is a comment")
    comment = await service.create_comment(create_data, owner.id)
    assert comment.content == "This is a comment"
    assert comment.task_id == task.id
    assert comment.user_id == owner.id

    retrieved = await service.list_comments(task.id, owner.id)
    assert retrieved.total == 1
    assert retrieved.items[0].id == comment.id


@pytest.mark.asyncio
async def test_non_member_cannot_comment(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    comment_repo = CommentRepository(db_session)
    service = CommentService(comment_repo, task_repo, project_repo, member_repo)

    owner = await user_repo.create(
        {
            "email": "owner_comment2@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    other = await user_repo.create(
        {
            "email": "other_comment2@example.com",
            "hashed_password": "pwd",
            "full_name": "Other",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj 1", "owner_id": owner.id})
    task = await task_repo.create({"title": "Task 1", "project_id": project.id})

    create_data = CommentCreate(task_id=task.id, content="Spam")
    with pytest.raises(ForbiddenException):
        await service.create_comment(create_data, other.id)


@pytest.mark.asyncio
async def test_update_and_delete_comment(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    task_repo = TaskRepository(db_session)
    comment_repo = CommentRepository(db_session)
    service = CommentService(comment_repo, task_repo, project_repo, member_repo)

    owner = await user_repo.create(
        {
            "email": "owner_comment3@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj 1", "owner_id": owner.id})
    task = await task_repo.create({"title": "Task 1", "project_id": project.id})

    comment = await service.create_comment(
        CommentCreate(task_id=task.id, content="Original"), owner.id
    )

    # Update
    updated = await service.update_comment(
        comment.id, CommentUpdate(content="Updated"), owner.id
    )
    assert updated.content == "Updated"

    # Delete
    await service.delete_comment(comment.id, owner.id)
    with pytest.raises(NotFoundException):
        await service.delete_comment(comment.id, owner.id)
