import pytest
from httpx import AsyncClient


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
async def test_comments_api_flow(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_cmt@example.com", "Owner Cmt"
    )
    headers_other = await get_auth_headers(
        client, "other_cmt@example.com", "Other Cmt"
    )

    # 1. Create project
    proj_res = await client.post(
        "/api/v1/projects", json={"name": "Cmt Proj"}, headers=headers_owner
    )
    project_id = proj_res.json()["data"]["id"]

    # 2. Create task
    task_res = await client.post(
        "/api/v1/tasks",
        json={"title": "Cmt Task", "project_id": project_id},
        headers=headers_owner,
    )
    task_id = task_res.json()["data"]["id"]

    # 3. Non-member posts comment -> 403
    fail_res = await client.post(
        "/api/v1/comments",
        json={"task_id": task_id, "content": "Hack"},
        headers=headers_other,
    )
    assert fail_res.status_code == 403

    # 4. Member posts comment -> 201
    ok_res = await client.post(
        "/api/v1/comments",
        json={"task_id": task_id, "content": "Awesome!"},
        headers=headers_owner,
    )
    assert ok_res.status_code == 201
    comment_id = ok_res.json()["data"]["id"]

    # 5. List comments -> 200
    list_res = await client.get(
        f"/api/v1/comments?task_id={task_id}", headers=headers_owner
    )
    assert list_res.status_code == 200
    assert list_res.json()["data"]["total"] == 1

    # 6. Delete comment -> 204
    del_res = await client.delete(
        f"/api/v1/comments/{comment_id}", headers=headers_owner
    )
    assert del_res.status_code == 204
