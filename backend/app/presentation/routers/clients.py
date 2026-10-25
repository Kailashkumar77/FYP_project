"""
CRM Clients Router (/api/v1/clients).
Handles Complete CRUD for Clients: List, Create, Get, Update, and Delete.
"""
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.crm_service import CRMService
from app.db.session import get_db
from app.infrastructure.models import User
from app.presentation.deps import get_current_user
from app.presentation.schemas.crm import (
    ClientCreate,
    ClientListResponse,
    ClientResponse,
    ClientUpdate
)

router = APIRouter(prefix="/clients", tags=["CRM Clients"])


@router.get(
    "",
    response_model=ClientListResponse,
    status_code=status.HTTP_200_OK,
    summary="List client accounts with search filtering"
)
async def list_clients(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    search: Optional[str] = Query(None, description="Search by company, contact, or industry"),
    include_archived: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    service = CRMService(db, current_user)
    return await service.list_clients(
        search=search,
        include_archived=include_archived,
        limit=limit,
        offset=offset
    )


@router.post(
    "",
    response_model=ClientResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new client account"
)
async def create_client(
    data: ClientCreate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.create_client(data)


@router.get(
    "/{client_id}",
    response_model=ClientResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve details of a single client account"
)
async def get_client(
    client_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.get_client(client_id)


@router.patch(
    "/{client_id}",
    response_model=ClientResponse,
    status_code=status.HTTP_200_OK,
    summary="Update an existing client account"
)
async def update_client(
    client_id: str,
    data: ClientUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.update_client(client_id, data)


@router.delete(
    "/{client_id}",
    status_code=status.HTTP_200_OK,
    summary="Archive / delete a client account"
)
async def delete_client(
    client_id: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.delete_client(client_id)
