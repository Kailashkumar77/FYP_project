"""
Authentication Router (/api/v1/auth).
Handles Registration, Login, Token Refresh, and Profile retrieval.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.auth_service import AuthService
from app.db.session import get_db
from app.infrastructure.models import Tenant, User
from app.presentation.deps import get_current_user
from app.presentation.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UserProfileResponse,
    TenantResponse
)

router = APIRouter(prefix="/auth", tags=["Authentication & Workspaces"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new agency workspace and Admin account"
)
async def register(
    req: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.register(req)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and issue JWT tokens"
)
async def login(
    req: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.login(req)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh an expired access token"
)
async def refresh(
    req: RefreshTokenRequest,
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.refresh_tokens(req.refresh_token)


@router.get(
    "/me",
    response_model=UserProfileResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve profile of the currently authenticated user and workspace"
)
async def get_me(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    tenant_res = await db.execute(
        select(Tenant).where(Tenant.id == current_user.tenant_id)
    )
    tenant = tenant_res.scalar_one()

    resp = UserProfileResponse.model_validate(current_user)
    resp.tenant = TenantResponse.model_validate(tenant)
    return resp
