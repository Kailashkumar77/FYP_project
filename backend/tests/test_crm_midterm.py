"""
Integration Tests for Midterm Deliverables:
- Authentication & Protected Routing
- User Profile Management
- Leads CRUD Operations
- Clients CRUD Operations
- Real Dashboard Metrics
"""
import pytest
from httpx import ASGITransport, AsyncClient
from app.db.init_db import seed_data
from app.main import app


@pytest.fixture(autouse=True)
async def setup_test_db():
    """Ensure database has seeded demo records before running test cases."""
    await seed_data()


@pytest.mark.asyncio
async def test_auth_login_success():
    """Verify login with demo credentials and token issuance."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@intellicrm.ai", "password": "Admin123!"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@intellicrm.ai"
        assert data["tenant"]["slug"] == "apex-software"


@pytest.mark.asyncio
async def test_auth_login_invalid():
    """Verify rejection of incorrect password."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@intellicrm.ai", "password": "WrongPassword!"}
        )
        assert response.status_code == 401
        assert "Invalid email or password" in response.json()["detail"]


@pytest.mark.asyncio
async def test_profile_management():
    """Verify authenticated user can view and update their profile."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        # 1. Login
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@intellicrm.ai", "password": "Admin123!"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Get Profile
        profile_res = await client.get("/api/v1/users/me", headers=headers)
        assert profile_res.status_code == 200
        assert profile_res.json()["email"] == "admin@intellicrm.ai"

        # 3. Update Profile
        update_res = await client.patch(
            "/api/v1/users/me",
            json={"full_name": "Kailash K. (Updated)", "phone": "+92 300 9999999"},
            headers=headers
        )
        assert update_res.status_code == 200
        assert update_res.json()["full_name"] == "Kailash K. (Updated)"
        assert update_res.json()["phone"] == "+92 300 9999999"


@pytest.mark.asyncio
async def test_leads_crud_workflow():
    """Verify complete CRUD lifecycle for Leads."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "agent@intellicrm.ai", "password": "Agent123!"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create Lead
        new_lead = {
            "company_name": "Test AI Robotics Inc",
            "contact_name": "Alex Mercer",
            "contact_email": "alex@airobotics.com",
            "contact_phone": "+1 555 123 4567",
            "budget": 55000.0,
            "domain_fit": 5,
            "requirement_clarity": 4,
            "lead_source": "Website",
            "stage": "New",
            "notes": "Autonomous fleet inspection software"
        }
        create_res = await client.post("/api/v1/leads", json=new_lead, headers=headers)
        assert create_res.status_code == 201
        lead_data = create_res.json()
        lead_id = lead_data["id"]
        assert lead_data["company_name"] == "Test AI Robotics Inc"
        assert lead_data["score"] > 80.0

        # 2. Read / List Leads
        list_res = await client.get("/api/v1/leads?search=Robotics", headers=headers)
        assert list_res.status_code == 200
        assert list_res.json()["total"] >= 1
        assert list_res.json()["items"][0]["company_name"] == "Test AI Robotics Inc"

        # 3. View Details
        get_res = await client.get(f"/api/v1/leads/{lead_id}", headers=headers)
        assert get_res.status_code == 200
        assert get_res.json()["contact_name"] == "Alex Mercer"

        # 4. Update Lead Stage
        update_res = await client.patch(
            f"/api/v1/leads/{lead_id}",
            json={"stage": "Proposal Sent", "budget": 65000.0},
            headers=headers
        )
        assert update_res.status_code == 200
        assert update_res.json()["stage"] == "Proposal Sent"
        assert update_res.json()["budget"] == 65000.0

        # 5. Delete / Archive Lead
        del_res = await client.delete(f"/api/v1/leads/{lead_id}", headers=headers)
        assert del_res.status_code == 200

        # Verify not returned in normal list
        list_after = await client.get("/api/v1/leads?search=Robotics", headers=headers)
        assert list_after.json()["total"] == 0


@pytest.mark.asyncio
async def test_clients_crud_workflow():
    """Verify complete CRUD lifecycle for Clients."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@intellicrm.ai", "password": "Admin123!"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 1. Create Client
        new_client = {
            "company_name": "Quantum Leap Logistics",
            "primary_contact": "David Sterling",
            "contact_email": "david@quantumleap.com",
            "contact_phone": "+1 555 888 9999",
            "industry": "Supply Chain & Logistics",
            "address": "500 Logistics Blvd, Atlanta, GA",
            "churn_risk_level": "LOW"
        }
        create_res = await client.post("/api/v1/clients", json=new_client, headers=headers)
        assert create_res.status_code == 201
        client_id = create_res.json()["id"]

        # 2. Read / List Clients
        list_res = await client.get("/api/v1/clients?search=Quantum", headers=headers)
        assert list_res.status_code == 200
        assert list_res.json()["total"] >= 1

        # 3. Update Client
        update_res = await client.patch(
            f"/api/v1/clients/{client_id}",
            json={"churn_risk_level": "MEDIUM", "contact_phone": "+1 555 000 1111"},
            headers=headers
        )
        assert update_res.status_code == 200
        assert update_res.json()["churn_risk_level"] == "MEDIUM"

        # 4. Delete / Archive Client
        del_res = await client.delete(f"/api/v1/clients/{client_id}", headers=headers)
        assert del_res.status_code == 200


@pytest.mark.asyncio
async def test_dashboard_metrics():
    """Verify dashboard metrics are computed from actual database records."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as client:
        login_res = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@intellicrm.ai", "password": "Admin123!"}
        )
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        metrics_res = await client.get("/api/v1/dashboard/metrics", headers=headers)
        assert metrics_res.status_code == 200
        data = metrics_res.json()
        assert data["total_leads"] >= 5
        assert data["total_clients"] >= 3
        assert data["total_pipeline_value"] > 100000.0
        assert len(data["stages"]) > 0
        assert len(data["recent_leads"]) > 0
        assert len(data["recent_clients"]) > 0
