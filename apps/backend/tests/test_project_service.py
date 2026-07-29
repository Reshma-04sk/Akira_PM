import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.exceptions import (
    ForbiddenException,
    NotFoundException,
    ValidationException,
)
from src.models.user import UserRole
from src.repositories.project_repository import ProjectRepository
from src.repositories.user_repository import UserRepository
from src.schemas.project import ProjectCreate, ProjectUpdate
from src.services.project_service import ProjectService


@pytest.mark.asyncio
async def test_create_and_get_project(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    # Create owner
    owner = await user_repo.create(
        {
            "email": "owner@example.com",
            "hashed_password": "hashed",
            "full_name": "Owner User",
            "role": UserRole.USER,
        }
    )

    # Create project
    create_data = ProjectCreate(name="Test Project", description="Test Description")
    proj = await service.create_project(create_data, owner.id)
    assert proj.name == "Test Project"
    assert proj.description == "Test Description"
    assert proj.owner_id == owner.id
    assert not proj.is_archived

    # Retrieve project
    retrieved = await service.get_project(proj.id, owner.id)
    assert retrieved.id == proj.id
    assert retrieved.name == "Test Project"


@pytest.mark.asyncio
async def test_create_duplicate_project_name_fails(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    owner = await user_repo.create(
        {
            "email": "dup@example.com",
            "hashed_password": "hashed",
            "full_name": "Dup User",
            "role": UserRole.USER,
        }
    )

    create_data = ProjectCreate(name="Unique Name")
    await service.create_project(create_data, owner.id)

    # Create again
    with pytest.raises(ValidationException):
        await service.create_project(create_data, owner.id)


@pytest.mark.asyncio
async def test_get_project_not_owner_fails(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    owner = await user_repo.create(
        {
            "email": "owner2@example.com",
            "hashed_password": "hashed",
            "full_name": "Owner User",
            "role": UserRole.USER,
        }
    )
    other_user = await user_repo.create(
        {
            "email": "other@example.com",
            "hashed_password": "hashed",
            "full_name": "Other User",
            "role": UserRole.USER,
        }
    )

    create_data = ProjectCreate(name="Private Project")
    proj = await service.create_project(create_data, owner.id)

    # Retrieve as other user
    with pytest.raises(ForbiddenException):
        await service.get_project(proj.id, other_user.id)


@pytest.mark.asyncio
async def test_update_project_by_owner(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    owner = await user_repo.create(
        {
            "email": "owner3@example.com",
            "hashed_password": "hashed",
            "full_name": "Owner User",
            "role": UserRole.USER,
        }
    )

    create_data = ProjectCreate(name="Original Name", description="Original Desc")
    proj = await service.create_project(create_data, owner.id)

    update_data = ProjectUpdate(name="Updated Name", description="Updated Desc")
    updated = await service.update_project(proj.id, update_data, owner.id)
    assert updated.name == "Updated Name"
    assert updated.description == "Updated Desc"


@pytest.mark.asyncio
async def test_update_project_not_owner_fails(
    db_session: AsyncSession,
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    owner = await user_repo.create(
        {
            "email": "owner4@example.com",
            "hashed_password": "hashed",
            "full_name": "Owner User",
            "role": UserRole.USER,
        }
    )
    other = await user_repo.create(
        {
            "email": "other4@example.com",
            "hashed_password": "hashed",
            "full_name": "Other User",
            "role": UserRole.USER,
        }
    )

    create_data = ProjectCreate(name="Project 1")
    proj = await service.create_project(create_data, owner.id)

    with pytest.raises(ForbiddenException):
        await service.update_project(proj.id, ProjectUpdate(name="New"), other.id)


@pytest.mark.asyncio
async def test_delete_and_list_projects(db_session: AsyncSession) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    service = ProjectService(project_repo)

    owner = await user_repo.create(
        {
            "email": "owner5@example.com",
            "hashed_password": "hashed",
            "full_name": "Owner User",
            "role": UserRole.USER,
        }
    )

    p1 = await service.create_project(ProjectCreate(name="Project Alpha"), owner.id)
    p2 = await service.create_project(ProjectCreate(name="Project Beta"), owner.id)

    # List active
    listed = await service.list_projects(owner_id=owner.id)
    assert listed.total == 2
    assert len(listed.items) == 2

    # Delete p1 (soft delete)
    await service.delete_project(p1.id, owner.id)

    # Get details of soft-deleted project should fail if get_by_id filters archived
    with pytest.raises(NotFoundException):
        await service.get_project(p1.id, owner.id)

    # List active again
    listed = await service.list_projects(owner_id=owner.id)
    assert listed.total == 1
    assert listed.items[0].id == p2.id
