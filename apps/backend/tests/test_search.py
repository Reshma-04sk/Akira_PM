from uuid import UUID

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.repositories.comment_repository import CommentRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.task import TaskCreate
from src.services.search_service import SearchService
from src.services.task_service import TaskService


async def get_auth_headers(
    client: AsyncClient, email: str, name: str
) -> dict[str, str]:
    reg_payload = {
        "email": email,
        "password": "Password123!",
        "full_name": name,
    }
    await client.post("/api/v1/auth/register", json=reg_payload)

    login_payload = {"email": email, "password": "Password123!"}
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    access_token = login_res.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {access_token}"}


@pytest.mark.asyncio
async def test_search_service_and_api(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    user_repo = UserRepository(db_session)
    project_repo = ProjectRepository(db_session)
    task_repo = TaskRepository(db_session)
    comment_repo = CommentRepository(db_session)

    task_service = TaskService(task_repo, project_repo, user_repo)
    search_service = SearchService(project_repo, task_repo, comment_repo, user_repo)

    # 1. Setup User
    headers = await get_auth_headers(client, "search_user@example.com", "Search User")
    me_res = await client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    user_id = UUID(me_res.json()["data"]["id"])

    # 2. Setup project, task, comment
    proj = await project_repo.create(
        {"name": "Amazing Project Alpha", "owner_id": user_id}
    )
    task = await task_service.create_task(
        TaskCreate(
            title="Implement search engine",
            project_id=proj.id,
            assignee_id=user_id,
        ),
        user_id,
    )
    await comment_repo.create(
        {
            "task_id": task.id,
            "user_id": user_id,
            "content": "This search matches keyword alpha.",
        }
    )

    # 3. Service search test
    res = await search_service.search(user_id, "engine")
    assert len(res.tasks) == 1
    assert res.tasks[0].title == "Implement search engine"

    res_alpha = await search_service.search(user_id, "alpha")
    assert len(res_alpha.projects) == 1
    assert len(res_alpha.comments) == 1

    # 4. API search test
    api_res = await client.get("/api/v1/search?q=engine", headers=headers)
    assert api_res.status_code == 200
    assert len(api_res.json()["data"]["tasks"]) == 1

    api_res_alpha = await client.get("/api/v1/search?q=alpha", headers=headers)
    assert api_res_alpha.status_code == 200
    assert len(api_res_alpha.json()["data"]["projects"]) == 1
    assert len(api_res_alpha.json()["data"]["comments"]) == 1

    # 5. Search for user by email/name query matching
    api_res_user = await client.get("/api/v1/search?q=Search", headers=headers)
    assert api_res_user.status_code == 200
    assert len(api_res_user.json()["data"]["users"]) == 1
    assert api_res_user.json()["data"]["users"][0]["email"] == "search_user@example.com"
