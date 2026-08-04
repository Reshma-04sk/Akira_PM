import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


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
async def test_workspace_endpoints(
    client: AsyncClient, db_session: AsyncSession
) -> None:
    # Set up two users
    owner_headers = await get_auth_headers(client, "owner@example.com", "Owner User")
    await get_auth_headers(client, "member@example.com", "Member User")

    # 1. List workspaces. The self-healing logic should auto-create a default workspace for Owner.
    list_res = await client.get("/api/v1/workspaces", headers=owner_headers)
    assert list_res.status_code == 200
    data = list_res.json()["data"]
    assert data["total"] == 1
    assert "Owner User's Workspace" in data["items"][0]["name"]
    data["items"][0]["id"]

    # 2. Create a new custom workspace
    create_res = await client.post(
        "/api/v1/workspaces",
        json={
            "name": "Engineering Team Workspace",
            "description": "Dev project management",
        },
        headers=owner_headers,
    )
    assert create_res.status_code == 201
    custom_ws = create_res.json()["data"]
    assert custom_ws["name"] == "Engineering Team Workspace"
    custom_ws_id = custom_ws["id"]

    # 3. List workspaces again (should have 2 now)
    list_res = await client.get("/api/v1/workspaces", headers=owner_headers)
    assert list_res.json()["data"]["total"] == 2

    # 4. Invite user member@example.com to Custom Workspace
    invite_res = await client.post(
        f"/api/v1/workspaces/{custom_ws_id}/members/invite",
        json={"email": "member@example.com", "role": "developer"},
        headers=owner_headers,
    )
    assert invite_res.status_code == 200
    assert invite_res.json()["data"]["role"] == "developer"
    assert invite_res.json()["data"]["email"] == "member@example.com"

    # Get member user_id
    member_user_id = invite_res.json()["data"]["user_id"]

    # 5. List workspace members
    members_res = await client.get(
        f"/api/v1/workspaces/{custom_ws_id}/members",
        headers=owner_headers,
    )
    assert members_res.status_code == 200
    members = members_res.json()["data"]
    assert len(members) == 2  # Owner + Invited Developer

    # 6. Update member's role to manager
    update_role_res = await client.patch(
        f"/api/v1/workspaces/{custom_ws_id}/members/{member_user_id}",
        json={"role": "manager"},
        headers=owner_headers,
    )
    assert update_role_res.status_code == 200
    assert update_role_res.json()["data"]["role"] == "manager"

    # 7. Remove member from workspace
    remove_res = await client.delete(
        f"/api/v1/workspaces/{custom_ws_id}/members/{member_user_id}",
        headers=owner_headers,
    )
    assert remove_res.status_code == 204

    # Verify membership deleted
    members_res = await client.get(
        f"/api/v1/workspaces/{custom_ws_id}/members",
        headers=owner_headers,
    )
    assert len(members_res.json()["data"]) == 1

    # 8. Delete workspace
    delete_res = await client.delete(
        f"/api/v1/workspaces/{custom_ws_id}",
        headers=owner_headers,
    )
    assert delete_res.status_code == 204

    # Verify deleted
    get_res = await client.get(
        f"/api/v1/workspaces/{custom_ws_id}",
        headers=owner_headers,
    )
    assert get_res.status_code == 404
