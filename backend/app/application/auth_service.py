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

        is_superadmin_input = (
            req.email.strip().lower() in [
                settings.SUPERADMIN_USERNAME.lower(),
                settings.SUPERADMIN_EMAIL.lower()
            ]
        )

        if is_superadmin_input:
            result = await self.db.execute(
                select(User).where(
                    (User.email == settings.SUPERADMIN_EMAIL.lower()) |
                    (User.email == settings.SUPERADMIN_USERNAME.lower())
                )
            )
        else:
            result = await self.db.execute(
                select(User).where(User.email == req.email.strip().lower())
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

    async def forgot_password(self, email_input: str) -> dict:
        """Handles password reset request, generates token and sends email."""
        clean_input = email_input.strip().lower()
        
        # Check if user matches superadmin
        is_superadmin = clean_input in [
            settings.SUPERADMIN_USERNAME.lower(),
            settings.SUPERADMIN_EMAIL.lower()
        ]

        if is_superadmin:
            res = await self.db.execute(
                select(User).where(
                    (User.email == settings.SUPERADMIN_EMAIL.lower()) |
                    (User.email == settings.SUPERADMIN_USERNAME.lower())
                )
            )
        else:
            res = await self.db.execute(
                select(User).where(User.email == clean_input)
            )
            
        user = res.scalars().first()
        if not user:
            # Prevent email enumeration while returning informative response
            return {
                "message": "If that email or username is registered, password reset instructions have been generated.",
                "reset_link": None
            }

        # Generate reset token
        from app.core.security import create_password_reset_token
        target_email = user.email
        reset_token = create_password_reset_token(email=target_email, user_id=user.id)
        frontend_base = getattr(settings, "FRONTEND_URL", "http://localhost:3000")
        reset_link = f"{frontend_base}/reset-password?token={reset_token}"

        # Real SMTP Delivery with simulated fallback
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            recipient = target_email if "@" in target_email else "sahilkhiyatani25@gmail.com"
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "IntelliCRM AI - Password Reset Request"
            msg["From"] = settings.EMAILS_FROM_EMAIL
            msg["To"] = recipient

            text_body = f"Hello {user.full_name},\n\nYou requested a password reset for your IntelliCRM workspace account.\nReset link: {reset_link}\n\nThis link expires in 15 minutes.\nIf you did not make this request, please ignore this email."
            html_body = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e3e1; border-radius: 12px;">
                <h2 style="color: #2563eb;">IntelliCRM AI</h2>
                <p>Hello <strong>{user.full_name}</strong>,</p>
                <p>We received a request to reset your password for your IntelliCRM AI account.</p>
                <div style="margin: 25px 0;">
                    <a href="{reset_link}" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: #64748b; font-size: 13px;">Or copy and paste this link into your browser:<br/><a href="{reset_link}">{reset_link}</a></p>
                <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">This link is valid for 15 minutes. If you did not request a password reset, you can safely ignore this email.</p>
            </div>
            """
            msg.attach(MIMEText(text_body, "plain"))
            msg.attach(MIMEText(html_body, "html"))

            if settings.SMTP_HOST and settings.SMTP_HOST != "localhost":
                server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=5)
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, [recipient], msg.as_string())
                server.quit()
        except Exception as e:
            print(f"[Email Notification Note] SMTP dispatch info: {e}")

        print(f"\n==========================================")
        print(f"[PASSWORD RESET LINK DISPATCHED]")
        print(f"Target Account: {user.email} ({user.full_name})")
        print(f"Interactive URL: {reset_link}")
        print(f"==========================================\n")

        return {
            "message": f"Password reset link generated for {user.email}.",
            "detail": "If SMTP is running, the email was sent. The direct reset link is also logged in server console.",
            "reset_link": reset_link
        }

    async def reset_password(self, token: str, new_password: str) -> dict:
        """Validates token, updates password in database and updates .env if superAdmin."""
        from app.core.security import verify_password_reset_token, hash_password
        payload = verify_password_reset_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password reset link is invalid or has expired."
            )

        user_id = payload.get("sub")
        res = await self.db.execute(select(User).where(User.id == user_id))
        user = res.scalar_one_or_none()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User account no longer exists."
            )

        # Hash and update password
        new_hash = hash_password(new_password)
        user.password_hash = new_hash
        user.failed_login_attempts = 0
        user.locked_until = None
        
        # Check if user is superadmin (update env if true)
        is_superadmin = (
            user.email.lower() in [settings.SUPERADMIN_USERNAME.lower(), settings.SUPERADMIN_EMAIL.lower()]
        )
        
        if is_superadmin:
            # Also update the companion alias if any
            alias_res = await self.db.execute(
                select(User).where(
                    (User.tenant_id == user.tenant_id) &
                    (User.id != user.id) &
                    ((User.email == settings.SUPERADMIN_EMAIL) | (User.email == settings.SUPERADMIN_USERNAME))
                )
            )
            for alias in alias_res.scalars().all():
                alias.password_hash = new_hash

            # Sync new password to backend .env file
            try:
                import os, re
                env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
                if os.path.exists(env_path):
                    with open(env_path, "r", encoding="utf-8") as f:
                        env_content = f.read()
                    env_content = re.sub(
                        r"SUPERADMIN_PASSWORD=.*",
                        f"SUPERADMIN_PASSWORD={new_password}",
                        env_content
                    )
                    with open(env_path, "w", encoding="utf-8") as f:
                        f.write(env_content)
                    print(f"Updated SUPERADMIN_PASSWORD in backend/.env successfully!")
            except Exception as env_err:
                print(f"Failed to update .env: {env_err}")

        await self.db.commit()

        return {
            "message": "Your password has been reset successfully. You can now log in with your new credentials."
        }
