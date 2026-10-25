"""
CRM Leads Router (/api/v1/leads).
Handles Complete CRUD for Leads: List, Create, Get, Update, and Delete.
"""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.crm_service import CRMService
from app.db.session import get_db
from app.infrastructure.models import User
from app.presentation.deps import get_current_user
from app.presentation.schemas.crm import (
    LeadCreate,
    LeadListResponse,
    LeadResponse,
    LeadUpdate
)

router = APIRouter(prefix="/leads", tags=["CRM Leads"])


@router.get(
    "",
    response_model=LeadListResponse,
    status_code=status.HTTP_200_OK,
    summary="List leads with search and stage filtering"
)
async def list_leads(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None, description="Search by company or contact"),
    stage: Optional[str] = Query(None, description="Filter by stage name"),
    include_archived: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    service = CRMService(db, current_user)
    return await service.list_leads(
        search=search,
        stage=stage,
        include_archived=include_archived,
        limit=limit,
        offset=offset
    )


@router.post(
    "",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new lead"
)
async def create_lead(
    data: LeadCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.create_lead(data)


@router.get(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve details of a single lead"
)
async def get_lead(
    lead_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.get_lead(lead_id)


@router.patch(
    "/{lead_id}",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing lead"
)
async def update_lead(
    lead_id: str,
    data: LeadUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.update_lead(lead_id, data)


@router.delete(
    "/{lead_id}",
    status_code=status.HTTP_200_OK,
    summary="Archive / delete a lead"
)
async def delete_lead(
    lead_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.delete_lead(lead_id)
