"""
User and Role Management Router (/api/v1/users).
Restricted to Admin users of the workspace.
"""
from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.auth_service import AuthService
from app.db.session import get_db
from app.infrastructure.models import User
from app.presentation.deps import get_current_user, require_admin
from app.presentation.schemas.auth import (
    ProfileUpdateRequest,
    UserInviteRequest,
    UserResponse,
    UserUpdateRequest
)

router = APIRouter(prefix="/users", tags=["User & Role Management"])


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve current user's profile"
)
async def get_my_profile(
    current_user: Annotated[User, Depends(get_current_user)]
):
    return UserResponse.model_validate(current_user)


@router.patch(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update current user's own profile (Full Name, Phone)"
)
async def update_my_profile(
    req: ProfileUpdateRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.phone is not None:
        current_user.phone = req.phone
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.get(
    "",
    response_model=List[UserResponse],
    status_code=status.HTTP_200_OK,
    summary="List all users in the current agency workspace (Admin only)"
)
async def list_users(
    current_admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.list_tenant_users(current_admin.tenant_id)


@router.post(
    "/invite",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Invite a new user with assigned role (Admin only)"
)
async def invite_user(
    req: UserInviteRequest,
    current_admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.invite_user(current_admin, req)


@router.patch(
    "/{user_id}",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Update user role or active status (Admin only)"
)
async def update_user(
    user_id: str,
    req: UserUpdateRequest,
    current_admin: Annotated[User, Depends(require_admin)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = AuthService(db)
    return await service.update_user(current_admin, user_id, req)
