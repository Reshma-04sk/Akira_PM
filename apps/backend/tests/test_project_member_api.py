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
async def test_project_member_api_auth_required(client: AsyncClient) -> None:
    res = await client.get(
        "/api/v1/project-members?project_id=00000000-0000-0000-0000-000000000000"
    )
    assert res.status_code == 401


@pytest.mark.asyncio
async def test_project_member_api_crud(client: AsyncClient) -> None:
    headers_owner = await get_auth_headers(
        client, "owner_member@example.com", "Owner Member"
    )
    headers_other = await get_auth_headers(
        client, "other_member@example.com", "Other Member"
    )

    # 1. Create project
    proj_res = await client.post(
        "/api/v1/projects",
        json={"name": "Project Members Proj"},
        headers=headers_owner,
    )
    project_id = proj_res.json()["data"]["id"]

    # Get user details for other member
    profile_res = await client.get("/api/v1/auth/me", headers=headers_other)
    other_user_id = profile_res.json()["data"]["id"]

    # 2. Add member
    add_res = await client.post(
        f"/api/v1/project-members?project_id={project_id}",
        json={"user_id": other_user_id, "role": "developer"},
        headers=headers_owner,
    )
    assert add_res.status_code == 201
    member_data = add_res.json()["data"]
    assert member_data["user_id"] == other_user_id
    assert member_data["role"] == "developer"

    # 3. Get member details
    get_res = await client.get(
        f"/api/v1/project-members/{other_user_id}?project_id={project_id}",
        headers=headers_owner,
    )
    assert get_res.status_code == 200
    assert get_res.json()["data"]["role"] == "developer"

    # 4. Update member role
    patch_res = await client.patch(
        f"/api/v1/project-members/{other_user_id}?project_id={project_id}",
        json={"role": "manager"},
        headers=headers_owner,
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["data"]["role"] == "manager"

    # 5. List members (pagination and role filters)
    list_res = await client.get(
        f"/api/v1/project-members?project_id={project_id}&role=manager",
        headers=headers_owner,
    )
    assert list_res.status_code == 200
    assert list_res.json()["data"]["total"] == 1
    assert list_res.json()["data"]["items"][0]["user_id"] == other_user_id

    # 6. Remove member
    del_res = await client.delete(
        f"/api/v1/project-members/{other_user_id}?project_id={project_id}",
        headers=headers_owner,
    )
    assert del_res.status_code == 204

    # 7. Get after removal -> 404
    get_del = await client.get(
        f"/api/v1/project-members/{other_user_id}?project_id={project_id}",
        headers=headers_owner,
    )
    assert get_del.status_code == 404
