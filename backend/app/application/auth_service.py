"""
Application Service for Authentication, Tenant Onboarding, and User Management.
"""
import re
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password
)
from app.infrastructure.models import PipelineStage, Tenant, User, UserRole
from app.presentation.schemas.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserInviteRequest,
    UserResponse,
    TenantResponse,
    UserUpdateRequest
)

DEFAULT_STAGES = [
    {"name": "New", "position": 0, "is_won": False, "is_lost": False},
    {"name": "Contacted", "position": 1, "is_won": False, "is_lost": False},
    {"name": "Proposal Sent", "position": 2, "is_won": False, "is_lost": False},
    {"name": "Negotiation", "position": 3, "is_won": False, "is_lost": False},
    {"name": "Won", "position": 4, "is_won": True, "is_lost": False},
    {"name": "Lost", "position": 5, "is_won": False, "is_lost": True},
]


def slugify(text: str) -> str:
    text = re.sub(r"[^\w\s-]", "", text.lower()).strip()
    return re.sub(r"[-\s]+", "-", text)


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def register(self, req: RegisterRequest) -> TokenResponse:
        """
        Creates a new Tenant, assigns the first Admin user, and provisions
        default Kanban stages for the workspace (REQ-4.1.4, REQ-4.1.5).
        """
        # 1. Check if email is already taken
        existing_user = await self.db.execute(
            select(User).where(User.email == req.email.lower())
        )
        if existing_user.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists"
            )

        # 2. Generate slug if not provided
        base_slug = req.agency_slug or slugify(req.agency_name)
        slug = base_slug
        count = 1
        while True:
            existing_tenant = await self.db.execute(
                select(Tenant).where(Tenant.slug == slug)
            )
            if not existing_tenant.scalar_one_or_none():
                break
            slug = f"{base_slug}-{count}"
            count += 1

        # 3. Create Tenant
        tenant = Tenant(
            name=req.agency_name,
            slug=slug,
            plan="STARTER"
        )
        self.db.add(tenant)
        await self.db.flush()

        # 4. Create Admin User
        admin_user = User(
            tenant_id=tenant.id,
            full_name=req.full_name,
            email=req.email.lower(),
            password_hash=hash_password(req.password),
            role=UserRole.ADMIN.value,
            is_active=True,
            is_verified=True
        )
        self.db.add(admin_user)
        await self.db.flush()

        # 5. Provision Default Pipeline Stages
        for stage_data in DEFAULT_STAGES:
            stage = PipelineStage(
                tenant_id=tenant.id,
                name=stage_data["name"],
                position=stage_data["position"],
                is_won_stage=stage_data["is_won"],
                is_lost_stage=stage_data["is_lost"]
            )
            self.db.add(stage)

        await self.db.commit()
        await self.db.refresh(admin_user)
        await self.db.refresh(tenant)

        # 6. Issue Tokens
        access_token = create_access_token(
            subject=admin_user.id,
            tenant_id=tenant.id,
            role=admin_user.role
        )
        refresh_token = create_refresh_token(
            subject=admin_user.id,
            tenant_id=tenant.id,
            role=admin_user.role
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(admin_user),
            tenant=TenantResponse.model_validate(tenant)
        )

    async def login(self, req: LoginRequest) -> TokenResponse:
        """
        Authenticates a user, verifies password hash, handles 5-failed-attempt
        lockout for 15 minutes, and issues signed JWT tokens (REQ-4.2.1-5).
        """
        now = datetime.now(timezone.utc)

        result = await self.db.execute(
            select(User).where(User.email == req.email.lower())
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Check account lockout
        if user.locked_until and user.locked_until > now:
            remaining_mins = int((user.locked_until - now).total_seconds() / 60) + 1
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Account is temporarily locked due to repeated failed login attempts. Try again in {remaining_mins} minute(s)."
            )

        # Check active status
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This user account has been deactivated. Contact your workspace administrator."
            )

        # Verify password
        if not verify_password(req.password, user.password_hash):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= settings.MAX_FAILED_LOGIN_ATTEMPTS:
                user.locked_until = now + timedelta(minutes=settings.ACCOUNT_LOCKOUT_MINUTES)
            await self.db.commit()
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # Reset failed attempts on success
        user.failed_login_attempts = 0
        user.locked_until = None
        await self.db.commit()
        await self.db.refresh(user)

        # Fetch tenant
        tenant_res = await self.db.execute(
            select(Tenant).where(Tenant.id == user.tenant_id)
        )
        tenant = tenant_res.scalar_one()

        access_token = create_access_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )
        refresh_token = create_refresh_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            tenant=TenantResponse.model_validate(tenant)
        )

    async def refresh_tokens(self, refresh_token: str) -> TokenResponse:
        """Validates a refresh token and issues a new access token."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        user_id = payload.get("sub")
        result = await self.db.execute(
            select(User).where(User.id == user_id, User.is_active == True)
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer active"
            )

        tenant_res = await self.db.execute(
            select(Tenant).where(Tenant.id == user.tenant_id)
        )
        tenant = tenant_res.scalar_one()

        access_token = create_access_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )
        new_refresh = create_refresh_token(
            subject=user.id,
            tenant_id=user.tenant_id,
            role=user.role
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=UserResponse.model_validate(user),
            tenant=TenantResponse.model_validate(tenant)
        )

    async def invite_user(self, current_admin: User, req: UserInviteRequest) -> UserResponse:
        """Invites a new team member to the current tenant workspace (REQ-4.3.1,4)."""
        existing = await self.db.execute(
            select(User).where(User.email == req.email.lower())
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists"
            )

        new_user = User(
            tenant_id=current_admin.tenant_id,
            full_name=req.full_name,
            email=req.email.lower(),
            password_hash=hash_password(req.temporary_password),
            role=req.role,
            is_active=True,
            is_verified=True
        )
        self.db.add(new_user)
        await self.db.commit()
        await self.db.refresh(new_user)
        return UserResponse.model_validate(new_user)

    async def list_tenant_users(self, tenant_id: str) -> List[UserResponse]:
        """Lists all users belonging to the given tenant workspace."""
        result = await self.db.execute(
            select(User)
            .where(User.tenant_id == tenant_id)
            .order_by(User.created_at.desc())
        )
        users = result.scalars().all()
        return [UserResponse.model_validate(u) for u in users]

    async def update_user(
        self,
        current_admin: User,
        user_id: str,
        req: UserUpdateRequest
    ) -> UserResponse:
        """
        Updates a user's details or active status with safeguards preventing
        the deactivation or demotion of the last remaining Admin (REQ-4.3.5).
        """
        result = await self.db.execute(
            select(User).where(
                User.id == user_id,
                User.tenant_id == current_admin.tenant_id
            )
        )
        target_user = result.scalar_one_or_none()
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found in this workspace"
            )

        # Safeguard: Do not deactivate or demote the last remaining active Admin (REQ-4.3.5)
        is_demoting_or_deactivating = (
            (req.role is not None and req.role != UserRole.ADMIN.value and target_user.role == UserRole.ADMIN.value)
            or (req.is_active is False and target_user.role == UserRole.ADMIN.value)
        )
        if is_demoting_or_deactivating:
            admin_count_res = await self.db.execute(
                select(func.count(User.id)).where(
                    User.tenant_id == current_admin.tenant_id,
                    User.role == UserRole.ADMIN.value,
                    User.is_active == True
                )
            )
            admin_count = admin_count_res.scalar() or 0
            if admin_count <= 1:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Cannot deactivate or demote the last remaining active Admin of this workspace."
                )

        if req.full_name is not None:
            target_user.full_name = req.full_name
        if req.role is not None:
            target_user.role = req.role
        if req.is_active is not None:
            target_user.is_active = req.is_active

        await self.db.commit()
        await self.db.refresh(target_user)
        return UserResponse.model_validate(target_user)
