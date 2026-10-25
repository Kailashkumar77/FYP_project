"""
Application Service for CRM Entities (Leads, Clients) and Dashboard Metrics.
Enforces multi-tenant data isolation on all operations.
"""
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.infrastructure.models import (
    ActivityLog,
    Client,
    Lead,
    PipelineStage,
    User
)
from app.presentation.schemas.crm import (
    ClientCreate,
    ClientListResponse,
    ClientResponse,
    ClientUpdate,
    DashboardMetricsResponse,
    LeadCreate,
    LeadListResponse,
    LeadResponse,
    LeadUpdate,
    StageMetric
)


class CRMService:
    def __init__(self, db: AsyncSession, current_user: User):
        self.db = db
        self.user = current_user
        self.tenant_id = current_user.tenant_id

    # ==================== LEADS CRUD ====================

    async def list_leads(
        self,
        search: Optional[str] = None,
        stage: Optional[str] = None,
        include_archived: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> LeadListResponse:
        """Lists leads for the current tenant with optional search and filtering."""
        query = select(Lead).where(Lead.tenant_id == self.tenant_id)

        if not include_archived:
            query = query.where(Lead.is_archived == False)

        if stage and stage.lower() != "all":
            query = query.where(func.lower(Lead.stage) == stage.lower())

        if search:
            search_filter = or_(
                Lead.company_name.ilike(f"%{search}%"),
                Lead.contact_name.ilike(f"%{search}%"),
                Lead.contact_email.ilike(f"%{search}%")
            )
            query = query.where(search_filter)

        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        # Execute paginated query
        query = query.order_by(Lead.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        leads = result.scalars().all()

        return LeadListResponse(
            items=[LeadResponse.model_validate(l) for l in leads],
            total=total
        )

    async def create_lead(self, data: LeadCreate) -> LeadResponse:
        """Creates a new lead for the current tenant and logs activity."""
        # Find stage_id matching stage name
        stage_res = await self.db.execute(
            select(PipelineStage).where(
                PipelineStage.tenant_id == self.tenant_id,
                func.lower(PipelineStage.name) == data.stage.lower()
            )
        )
        stage_obj = stage_res.scalar_one_or_none()
        stage_id = stage_obj.id if stage_obj else None

        # Calculate heuristic score
        base_score = 40.0
        base_score += (data.domain_fit * 7.0)
        base_score += (data.requirement_clarity * 5.0)
        if data.budget >= 50000:
            base_score += 15.0
        elif data.budget >= 20000:
            base_score += 10.0
        computed_score = min(99.0, max(15.0, base_score))

        lead = Lead(
            tenant_id=self.tenant_id,
            stage_id=stage_id,
            assigned_user_id=data.assigned_user_id or self.user.id,
            company_name=data.company_name,
            contact_name=data.contact_name,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            budget=data.budget,
            domain_fit=data.domain_fit,
            requirement_clarity=data.requirement_clarity,
            lead_source=data.lead_source,
            stage=data.stage,
            score=computed_score,
            notes=data.notes,
            is_archived=False
        )
        self.db.add(lead)
        await self.db.flush()

        # Log activity
        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="CREATE",
            entity_type="LEAD",
            entity_id=lead.id,
            details=f"Created new lead '{lead.company_name}' with ${lead.budget:,.2f} budget."
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(lead)

        return LeadResponse.model_validate(lead)

    async def get_lead(self, lead_id: str) -> LeadResponse:
        """Retrieves a single lead by ID enforcing tenant isolation."""
        result = await self.db.execute(
            select(Lead).where(
                Lead.id == lead_id,
                Lead.tenant_id == self.tenant_id
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found in this workspace"
            )
        return LeadResponse.model_validate(lead)

    async def update_lead(self, lead_id: str, data: LeadUpdate) -> LeadResponse:
        """Updates lead attributes and records changes in activity log."""
        result = await self.db.execute(
            select(Lead).where(
                Lead.id == lead_id,
                Lead.tenant_id == self.tenant_id
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found in this workspace"
            )

        update_dict = data.model_dump(exclude_unset=True)

        # Update stage reference if stage changed
        if "stage" in update_dict:
            stage_res = await self.db.execute(
                select(PipelineStage).where(
                    PipelineStage.tenant_id == self.tenant_id,
                    func.lower(PipelineStage.name) == update_dict["stage"].lower()
                )
            )
            stage_obj = stage_res.scalar_one_or_none()
            if stage_obj:
                lead.stage_id = stage_obj.id

        for field, value in update_dict.items():
            setattr(lead, field, value)

        # Log activity
        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="UPDATE",
            entity_type="LEAD",
            entity_id=lead.id,
            details=f"Updated details for lead '{lead.company_name}'."
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(lead)

        return LeadResponse.model_validate(lead)

    async def delete_lead(self, lead_id: str) -> dict:
        """Soft-deletes / archives a lead record (REQ-4.4.1)."""
        result = await self.db.execute(
            select(Lead).where(
                Lead.id == lead_id,
                Lead.tenant_id == self.tenant_id
            )
        )
        lead = result.scalar_one_or_none()
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lead not found in this workspace"
            )

        lead.is_archived = True

        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="DELETE",
            entity_type="LEAD",
            entity_id=lead.id,
            details=f"Archived lead '{lead.company_name}'."
        )
        self.db.add(log)
        await self.db.commit()

        return {"message": "Lead archived successfully", "id": lead_id}

    # ==================== CLIENTS CRUD ====================

    async def list_clients(
        self,
        search: Optional[str] = None,
        include_archived: bool = False,
        limit: int = 50,
        offset: int = 0
    ) -> ClientListResponse:
        """Lists clients for the current tenant with search filtering."""
        query = select(Client).where(Client.tenant_id == self.tenant_id)

        if not include_archived:
            query = query.where(Client.is_archived == False)

        if search:
            search_filter = or_(
                Client.company_name.ilike(f"%{search}%"),
                Client.primary_contact.ilike(f"%{search}%"),
                Client.contact_email.ilike(f"%{search}%"),
                Client.industry.ilike(f"%{search}%")
            )
            query = query.where(search_filter)

        count_query = select(func.count()).select_from(query.subquery())
        total_res = await self.db.execute(count_query)
        total = total_res.scalar() or 0

        query = query.order_by(Client.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(query)
        clients = result.scalars().all()

        return ClientListResponse(
            items=[ClientResponse.model_validate(c) for c in clients],
            total=total
        )

    async def create_client(self, data: ClientCreate) -> ClientResponse:
        """Creates a new client account for the current tenant and logs activity."""
        client = Client(
            tenant_id=self.tenant_id,
            converted_from_lead_id=data.converted_from_lead_id,
            account_manager_id=data.account_manager_id or self.user.id,
            company_name=data.company_name,
            primary_contact=data.primary_contact,
            contact_email=data.contact_email,
            contact_phone=data.contact_phone,
            industry=data.industry,
            address=data.address,
            churn_risk_level=data.churn_risk_level,
            is_archived=False
        )
        self.db.add(client)
        await self.db.flush()

        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="CREATE",
            entity_type="CLIENT",
            entity_id=client.id,
            details=f"Created client account '{client.company_name}'."
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(client)

        return ClientResponse.model_validate(client)

    async def get_client(self, client_id: str) -> ClientResponse:
        """Retrieves a single client by ID enforcing tenant isolation."""
        result = await self.db.execute(
            select(Client).where(
                Client.id == client_id,
                Client.tenant_id == self.tenant_id
            )
        )
        client = result.scalar_one_or_none()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found in this workspace"
            )
        return ClientResponse.model_validate(client)

    async def update_client(self, client_id: str, data: ClientUpdate) -> ClientResponse:
        """Updates client details and records changes in activity log."""
        result = await self.db.execute(
            select(Client).where(
                Client.id == client_id,
                Client.tenant_id == self.tenant_id
            )
        )
        client = result.scalar_one_or_none()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found in this workspace"
            )

        update_dict = data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(client, field, value)

        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="UPDATE",
            entity_type="CLIENT",
            entity_id=client.id,
            details=f"Updated details for client '{client.company_name}'."
        )
        self.db.add(log)
        await self.db.commit()
        await self.db.refresh(client)

        return ClientResponse.model_validate(client)

    async def delete_client(self, client_id: str) -> dict:
        """Soft-deletes / archives a client record."""
        result = await self.db.execute(
            select(Client).where(
                Client.id == client_id,
                Client.tenant_id == self.tenant_id
            )
        )
        client = result.scalar_one_or_none()
        if not client:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Client not found in this workspace"
            )

        client.is_archived = True

        log = ActivityLog(
            tenant_id=self.tenant_id,
            user_id=self.user.id,
            action="DELETE",
            entity_type="CLIENT",
            entity_id=client.id,
            details=f"Archived client '{client.company_name}'."
        )
        self.db.add(log)
        await self.db.commit()

        return {"message": "Client archived successfully", "id": client_id}

    # ==================== DASHBOARD METRICS ====================

    async def get_dashboard_metrics(self) -> DashboardMetricsResponse:
        """Calculates live dashboard indicators directly from PostgreSQL queries."""
        # 1. Total active leads
        leads_count_res = await self.db.execute(
            select(func.count(Lead.id)).where(
                Lead.tenant_id == self.tenant_id,
                Lead.is_archived == False
            )
        )
        total_leads = leads_count_res.scalar() or 0

        # 2. Total active clients
        clients_count_res = await self.db.execute(
            select(func.count(Client.id)).where(
                Client.tenant_id == self.tenant_id,
                Client.is_archived == False
            )
        )
        total_clients = clients_count_res.scalar() or 0

        # 3. Total pipeline value
        pipeline_val_res = await self.db.execute(
            select(func.sum(Lead.budget)).where(
                Lead.tenant_id == self.tenant_id,
                Lead.is_archived == False
            )
        )
        total_pipeline_val = pipeline_val_res.scalar() or 0.0

        # 4. Won leads count for conversion rate calculation
        won_count_res = await self.db.execute(
            select(func.count(Lead.id)).where(
                Lead.tenant_id == self.tenant_id,
                Lead.is_archived == False,
                func.lower(Lead.stage) == "won"
            )
        )
        won_count = won_count_res.scalar() or 0
        conversion_rate = (won_count / total_leads * 100.0) if total_leads > 0 else 0.0

        # 5. Stage Breakdown
        stage_group_res = await self.db.execute(
            select(
                Lead.stage,
                func.count(Lead.id),
                func.sum(Lead.budget)
            ).where(
                Lead.tenant_id == self.tenant_id,
                Lead.is_archived == False
            ).group_by(Lead.stage)
        )
        stage_rows = stage_group_res.all()
        stage_metrics = [
            StageMetric(
                stage=row[0],
                count=row[1],
                value=float(row[2] or 0.0)
            ) for row in stage_rows
        ]

        # 6. Recent 5 Leads
        recent_leads_res = await self.db.execute(
            select(Lead)
            .where(Lead.tenant_id == self.tenant_id, Lead.is_archived == False)
            .order_by(Lead.created_at.desc())
            .limit(5)
        )
        recent_leads = recent_leads_res.scalars().all()

        # 7. Recent 5 Clients
        recent_clients_res = await self.db.execute(
            select(Client)
            .where(Client.tenant_id == self.tenant_id, Client.is_archived == False)
            .order_by(Client.created_at.desc())
            .limit(5)
        )
        recent_clients = recent_clients_res.scalars().all()

        return DashboardMetricsResponse(
            total_leads=total_leads,
            total_clients=total_clients,
            total_pipeline_value=total_pipeline_val,
            conversion_rate=round(conversion_rate, 1),
            stages=stage_metrics,
            recent_leads=[LeadResponse.model_validate(l) for l in recent_leads],
            recent_clients=[ClientResponse.model_validate(c) for c in recent_clients]
        )
