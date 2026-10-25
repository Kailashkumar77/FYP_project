"""
Database Initialization and Seed Data Provisioning.
Creates tables and seeds demonstration workspace, demo accounts, leads, and clients.
"""
import asyncio
from datetime import datetime, timezone
from sqlalchemy import select
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import engine, AsyncSessionLocal
from app.infrastructure.models import (
    Tenant,
    User,
    PipelineStage,
    Lead,
    Client,
    ActivityLog,
    UserRole
)


async def init_database():
    """Create all tables in the connected database engine."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def seed_data():
    """Populates realistic demo accounts and CRM records for the midterm demonstration."""
    await init_database()

    async with AsyncSessionLocal() as session:
        # Check if demo tenant already exists
        result = await session.execute(
            select(Tenant).where(Tenant.slug == "apex-software")
        )
        existing_tenant = result.scalar_one_or_none()

        if existing_tenant:
            print("Database already contains demo workspace: apex-software.")
            return

        print("Seeding demo workspace: Apex Software Solutions...")

        # 1. Create Workspace / Tenant
        tenant = Tenant(
            name="Apex Software Solutions",
            slug="apex-software",
            plan="PRO",
            logo_url="https://images.unsplash.com/photo-1551434678-e076c223a692?w=100&auto=format&fit=crop&q=80"
        )
        session.add(tenant)
        await session.flush()

        # 2. Create Users
        admin_user = User(
            tenant_id=tenant.id,
            full_name="Kailash Kumar (Admin)",
            email="admin@intellicrm.ai",
            password_hash=hash_password("Admin123!"),
            role=UserRole.ADMIN.value,
            phone="+92 300 1234567",
            is_active=True,
            is_verified=True
        )
        agent_user = User(
            tenant_id=tenant.id,
            full_name="Iqra Qasim (Sales Agent)",
            email="agent@intellicrm.ai",
            password_hash=hash_password("Agent123!"),
            role=UserRole.SALES_AGENT.value,
            phone="+92 301 7654321",
            is_active=True,
            is_verified=True
        )
        session.add_all([admin_user, agent_user])
        await session.flush()

        # 3. Create Pipeline Stages
        stages_data = [
            ("New", 0, False, False),
            ("Contacted", 1, False, False),
            ("Proposal Sent", 2, False, False),
            ("Negotiation", 3, False, False),
            ("Won", 4, True, False),
            ("Lost", 5, False, True),
        ]
        stage_map = {}
        for name, pos, is_won, is_lost in stages_data:
            stage = PipelineStage(
                tenant_id=tenant.id,
                name=name,
                position=pos,
                is_won_stage=is_won,
                is_lost_stage=is_lost
            )
            session.add(stage)
            await session.flush()
            stage_map[name] = stage

        # 4. Seed Leads
        sample_leads = [
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["Proposal Sent"].id,
                assigned_user_id=agent_user.id,
                company_name="Fintech Horizons Ltd",
                contact_name="Sarah Jenkins",
                contact_email="sarah.j@fintechhorizons.com",
                contact_phone="+1 (555) 234-5678",
                budget=45000.0,
                domain_fit=5,
                requirement_clarity=4,
                lead_source="Inbound Website",
                stage="Proposal Sent",
                score=88.5,
                notes="Interested in full-stack cross-platform banking portal with biometric security."
            ),
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["Negotiation"].id,
                assigned_user_id=admin_user.id,
                company_name="CloudScale Infrastructure",
                contact_name="Marcus Vance",
                contact_email="m.vance@cloudscale.io",
                contact_phone="+1 (555) 345-6789",
                budget=72000.0,
                domain_fit=4,
                requirement_clarity=5,
                lead_source="Referral",
                stage="Negotiation",
                score=92.0,
                notes="Kubernetes cluster migration and automated CI/CD deployment pipeline."
            ),
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["New"].id,
                assigned_user_id=agent_user.id,
                company_name="MedCare Telehealth",
                contact_name="Dr. Elena Rostova",
                contact_email="elena@medcare-telehealth.com",
                contact_phone="+1 (555) 456-7890",
                budget=28000.0,
                domain_fit=4,
                requirement_clarity=3,
                lead_source="LinkedIn Outreach",
                stage="New",
                score=65.0,
                notes="HIPAA-compliant patient consultation mobile app."
            ),
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["Contacted"].id,
                assigned_user_id=agent_user.id,
                company_name="LogiTrans Fleet Management",
                contact_name="David Chen",
                contact_email="dchen@logitrans.net",
                contact_phone="+1 (555) 567-8901",
                budget=38000.0,
                domain_fit=3,
                requirement_clarity=4,
                lead_source="Google Ads",
                stage="Contacted",
                score=74.0,
                notes="Real-time IoT telematics tracking dashboard."
            ),
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["Won"].id,
                assigned_user_id=admin_user.id,
                company_name="Nexus Financial",
                contact_name="Robert Sterling",
                contact_email="sterling@nexusfin.com",
                contact_phone="+1 (555) 678-9012",
                budget=60000.0,
                domain_fit=5,
                requirement_clarity=5,
                lead_source="Partner",
                stage="Won",
                score=96.0,
                notes="Contract finalized for automated trading ledger integration."
            ),
            Lead(
                tenant_id=tenant.id,
                stage_id=stage_map["Lost"].id,
                assigned_user_id=agent_user.id,
                company_name="QuickMart Express",
                contact_name="Tina Reynolds",
                contact_email="tina@quickmartexpress.com",
                contact_phone="+1 (555) 789-0123",
                budget=12000.0,
                domain_fit=2,
                requirement_clarity=2,
                lead_source="Cold Call",
                stage="Lost",
                score=35.0,
                notes="Budget below minimum agency threshold."
            ),
        ]
        session.add_all(sample_leads)
        await session.flush()

        # 5. Seed Clients
        sample_clients = [
            Client(
                tenant_id=tenant.id,
                converted_from_lead_id=sample_leads[4].id,  # Converted from Nexus Financial
                account_manager_id=admin_user.id,
                company_name="Nexus Financial",
                primary_contact="Robert Sterling",
                contact_email="sterling@nexusfin.com",
                contact_phone="+1 (555) 678-9012",
                industry="Financial Services",
                address="100 Wall Street, Suite 1400, New York, NY",
                churn_risk_level="LOW"
            ),
            Client(
                tenant_id=tenant.id,
                account_manager_id=admin_user.id,
                company_name="BioHealth Diagnostics",
                primary_contact="Karen Mitchell",
                contact_email="karen@biohealthdiag.org",
                contact_phone="+1 (555) 890-1234",
                industry="Healthcare & Biotech",
                address="450 Research Parkway, Boston, MA",
                churn_risk_level="LOW"
            ),
            Client(
                tenant_id=tenant.id,
                account_manager_id=agent_user.id,
                company_name="OmniRetail Global",
                primary_contact="Thomas Wright",
                contact_email="twright@omniretail.com",
                contact_phone="+1 (555) 901-2345",
                industry="Retail & E-Commerce",
                address="750 Michigan Avenue, Chicago, IL",
                churn_risk_level="MEDIUM"
            ),
        ]
        session.add_all(sample_clients)
        await session.flush()

        # 6. Seed Activity Logs
        logs = [
            ActivityLog(
                tenant_id=tenant.id,
                user_id=admin_user.id,
                action="CREATE",
                entity_type="CLIENT",
                entity_id=sample_clients[0].id,
                details="Converted won lead 'Nexus Financial' into an active client account."
            ),
            ActivityLog(
                tenant_id=tenant.id,
                user_id=agent_user.id,
                action="UPDATE",
                entity_type="LEAD",
                entity_id=sample_leads[0].id,
                details="Advanced 'Fintech Horizons Ltd' deal to Proposal Sent stage."
            ),
            ActivityLog(
                tenant_id=tenant.id,
                user_id=admin_user.id,
                action="CREATE",
                entity_type="LEAD",
                entity_id=sample_leads[1].id,
                details="Created high-value referral lead 'CloudScale Infrastructure' ($72,000)."
            ),
        ]
        session.add_all(logs)

        await session.commit()
        print("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())
