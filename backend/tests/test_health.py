"""
Unit and integration tests for backend health check endpoints.
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verify that root endpoint returns welcome payload."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "Welcome to IntelliCRM AI API" in data["message"]
        assert data["health"] == "/api/v1/health"


@pytest.mark.asyncio
async def test_health_endpoint():
    """Verify that API process health check returns healthy status."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["app"] == "IntelliCRM AI"


@pytest.mark.asyncio
async def test_db_health_endpoint():
    """Verify that the database health check connects successfully."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/health/db")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"
