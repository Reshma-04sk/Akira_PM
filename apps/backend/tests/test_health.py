import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient) -> None:
    """Verifies that the health check endpoint returns 200 and indicates active DB connectivity."""
    response = await client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()

    assert payload["success"] is True
    assert payload["data"]["status"] == "ok"
    assert payload["data"]["database"] == "connected"
