import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ForbiddenException,
    ValidationException,
)
from src.models.project_member import ProjectRole
from src.models.user import UserRole
from src.repositories.project_member_repository import ProjectMemberRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.schemas.project_member import ProjectMemberCreate, ProjectMemberUpdate
from src.services.project_member_service import ProjectMemberService


@pytest.mark.asyncio
async def test_add_and_get_member(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    service = ProjectMemberService(member_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    user = await user_repo.create(
        {
            "email": "user@example.com",
            "hashed_password": "pwd",
            "full_name": "User",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj", "owner_id": owner.id})

    create_data = ProjectMemberCreate(user_id=user.id, role=ProjectRole.DEVELOPER)
    member = await service.add_member(project.id, create_data, owner.id)
    assert member.user_id == user.id
    assert member.role == ProjectRole.DEVELOPER

    retrieved = await service.get_member(project.id, user.id, owner.id)
    assert retrieved.id == member.id


@pytest.mark.asyncio
async def test_add_duplicate_member_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    service = ProjectMemberService(member_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner2@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    user = await user_repo.create(
        {
            "email": "user2@example.com",
            "hashed_password": "pwd",
            "full_name": "User",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj", "owner_id": owner.id})

    create_data = ProjectMemberCreate(user_id=user.id, role=ProjectRole.DEVELOPER)
    await service.add_member(project.id, create_data, owner.id)

    with pytest.raises(ValidationException):
        await service.add_member(project.id, create_data, owner.id)


@pytest.mark.asyncio
async def test_last_owner_protection(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    service = ProjectMemberService(member_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner3@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    user = await user_repo.create(
        {
            "email": "user3@example.com",
            "hashed_password": "pwd",
            "full_name": "User",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj", "owner_id": owner.id})

    # Add user as OWNER
    await service.add_member(
        project.id,
        ProjectMemberCreate(user_id=user.id, role=ProjectRole.OWNER),
        owner.id,
    )

    # Attempt to demote the only OWNER member
    with pytest.raises(ValidationException):
        await service.update_member_role(
            project.id,
            user.id,
            ProjectMemberUpdate(role=ProjectRole.DEVELOPER),
            owner.id,
        )

    # Attempt to remove the only OWNER member
    with pytest.raises(ValidationException):
        await service.remove_member(project.id, user.id, owner.id)


@pytest.mark.asyncio
async def test_owner_and_manager_restrictions(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    member_repo = ProjectMemberRepository(db_session)
    service = ProjectMemberService(member_repo, project_repo, user_repo)

    owner = await user_repo.create(
        {
            "email": "owner4@example.com",
            "hashed_password": "pwd",
            "full_name": "Owner",
            "role": UserRole.USER,
        }
    )
    manager = await user_repo.create(
        {
            "email": "mgr4@example.com",
            "hashed_password": "pwd",
            "full_name": "Manager",
            "role": UserRole.USER,
        }
    )
    dev = await user_repo.create(
        {
            "email": "dev4@example.com",
            "hashed_password": "pwd",
            "full_name": "Developer",
            "role": UserRole.USER,
        }
    )
    project = await project_repo.create({"name": "Proj", "owner_id": owner.id})

    # Add manager
    await service.add_member(
        project.id,
        ProjectMemberCreate(user_id=manager.id, role=ProjectRole.MANAGER),
        owner.id,
    )

    # Manager adds developer: Allowed
    await service.add_member(
        project.id,
        ProjectMemberCreate(user_id=dev.id, role=ProjectRole.DEVELOPER),
        manager.id,
    )

    # Developer tries to add another user: Forbidden
    other = await user_repo.create(
        {
            "email": "other4@example.com",
            "hashed_password": "pwd",
            "full_name": "Other",
            "role": UserRole.USER,
        }
    )
    with pytest.raises(ForbiddenException):
        await service.add_member(
            project.id,
            ProjectMemberCreate(user_id=other.id, role=ProjectRole.VIEWER),
            dev.id,
        )

    # Manager tries to assign OWNER role: Forbidden
    with pytest.raises(ForbiddenException):
        await service.update_member_role(
            project.id,
            dev.id,
            ProjectMemberUpdate(role=ProjectRole.OWNER),
            manager.id,
        )
