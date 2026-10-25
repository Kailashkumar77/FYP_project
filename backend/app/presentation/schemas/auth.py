"""
Pydantic Schemas for Authentication, Users, and Multi-Tenant Workspaces.
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field


class TenantBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=255, description="Agency name")
    slug: Optional[str] = Field(None, max_length=100, description="Unique workspace slug")


class TenantResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    slug: str
    plan: str
    logo_url: Optional[str] = None
    created_at: datetime


class UserBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    full_name: str
    email: str
    role: str
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=50)


class UserProfileResponse(UserResponse):
    tenant: Optional[TenantResponse] = None


class RegisterRequest(BaseModel):
    agency_name: str = Field(..., min_length=2, max_length=255, description="Agency / Software House name")
    agency_slug: Optional[str] = Field(None, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse
    tenant: TenantResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserInviteRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    role: str = Field(default="SALES_AGENT", pattern="^(ADMIN|SALES_AGENT|ACCOUNT_MANAGER)$")
    temporary_password: Optional[str] = Field(default="ChangeMe123!", min_length=8)


class UserUpdateRequest(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    role: Optional[str] = Field(None, pattern="^(ADMIN|SALES_AGENT|ACCOUNT_MANAGER)$")
    is_active: Optional[bool] = None


class PipelineStageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    position: int
    is_won_stage: bool
    is_lost_stage: bool
