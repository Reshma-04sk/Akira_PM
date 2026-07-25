import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.audit_log import AuditLog


@pytest.mark.asyncio
async def test_audit_log_flows(client: AsyncClient, db_session: AsyncSession) -> None:
    # 1. Register a user
    reg_payload = {
        "email": "audit_tester@example.com",
        "password": "Password123!",
        "full_name": "Audit Tester",
    }
    reg_res = await client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201

    # Check if a user_register audit log was generated
    stmt = select(AuditLog).where(AuditLog.action == "user_register")
    res = await db_session.execute(stmt)
    register_logs = list(res.scalars().all())
    assert len(register_logs) == 1
    assert register_logs[0].details["email"] == "audit_tester@example.com"

    # 2. Login as the user
    login_payload = {"email": "audit_tester@example.com", "password": "Password123!"}
    login_res = await client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    access_token = login_res.json()["data"]["access_token"]
    refresh_token = login_res.json()["data"]["refresh_token"]

    # Check if a user_login audit log was generated
    stmt = select(AuditLog).where(AuditLog.action == "user_login")
    res = await db_session.execute(stmt)
    login_logs = list(res.scalars().all())
    assert len(login_logs) == 1
    assert login_logs[0].details["status"] == "success"

    # 3. Retrieve audit logs via GET endpoint
    headers = {"Authorization": f"Bearer {access_token}"}
    logs_res = await client.get("/api/v1/audit-logs", headers=headers)
    assert logs_res.status_code == 200
    logs_data = logs_res.json()
    assert logs_data["success"] is True
    assert "data" in logs_data
    assert len(logs_data["data"]) >= 2  # register and login logs
    assert logs_data["pagination"]["total"] >= 2

    # Check specific fields in response
    actions = [log["action"] for log in logs_data["data"]]
    assert "user_register" in actions
    assert "user_login" in actions
    assert logs_data["data"][0]["user_email"] == "audit_tester@example.com"

    # 4. Logout user
    logout_res = await client.post(
        "/api/v1/auth/logout", json={"refresh_token": refresh_token}
    )
    assert logout_res.status_code == 200

    # Check if a user_logout audit log was generated
    stmt = select(AuditLog).where(AuditLog.action == "user_logout")
    res = await db_session.execute(stmt)
    logout_logs = list(res.scalars().all())
    assert len(logout_logs) == 1
