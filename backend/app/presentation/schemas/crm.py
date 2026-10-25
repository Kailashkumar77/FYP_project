"""
Pydantic Schemas for Leads, Clients, and Dashboard Metrics.
"""
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ==================== LEAD SCHEMAS ====================

class LeadBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    contact_name: str = Field(..., min_length=2, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=50)
    budget: float = Field(default=0.0, ge=0.0)
    domain_fit: int = Field(default=3, ge=1, le=5, description="Domain fit rating 1-5")
    requirement_clarity: int = Field(default=3, ge=1, le=5, description="Clarity rating 1-5")
    lead_source: str = Field(default="Direct", max_length=100)
    stage: str = Field(default="New", max_length=50)
    notes: Optional[str] = None


class LeadCreate(LeadBase):
    assigned_user_id: Optional[str] = None


class LeadUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    contact_name: Optional[str] = Field(None, min_length=2, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    budget: Optional[float] = Field(None, ge=0.0)
    domain_fit: Optional[int] = Field(None, ge=1, le=5)
    requirement_clarity: Optional[int] = Field(None, ge=1, le=5)
    lead_source: Optional[str] = None
    stage: Optional[str] = None
    assigned_user_id: Optional[str] = None
    notes: Optional[str] = None
    is_archived: Optional[bool] = None


class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    stage_id: Optional[str] = None
    assigned_user_id: Optional[str] = None
    score: float
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class LeadListResponse(BaseModel):
    items: List[LeadResponse]
    total: int


# ==================== CLIENT SCHEMAS ====================

class ClientBase(BaseModel):
    company_name: str = Field(..., min_length=2, max_length=255)
    primary_contact: str = Field(..., min_length=2, max_length=255)
    contact_email: EmailStr
    contact_phone: Optional[str] = Field(None, max_length=50)
    industry: str = Field(default="IT Services", max_length=100)
    address: Optional[str] = Field(None, max_length=500)
    churn_risk_level: str = Field(default="LOW", pattern="^(LOW|MEDIUM|HIGH)$")


class ClientCreate(ClientBase):
    converted_from_lead_id: Optional[str] = None
    account_manager_id: Optional[str] = None


class ClientUpdate(BaseModel):
    company_name: Optional[str] = Field(None, min_length=2, max_length=255)
    primary_contact: Optional[str] = Field(None, min_length=2, max_length=255)
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    industry: Optional[str] = None
    address: Optional[str] = None
    churn_risk_level: Optional[str] = Field(None, pattern="^(LOW|MEDIUM|HIGH)$")
    account_manager_id: Optional[str] = None
    is_archived: Optional[bool] = None


class ClientResponse(ClientBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tenant_id: str
    converted_from_lead_id: Optional[str] = None
    account_manager_id: Optional[str] = None
    is_archived: bool
    created_at: datetime
    updated_at: datetime


class ClientListResponse(BaseModel):
    items: List[ClientResponse]
    total: int


# ==================== DASHBOARD METRICS ====================

class StageMetric(BaseModel):
    stage: str
    count: int
    value: float


class DashboardMetricsResponse(BaseModel):
    total_leads: int
    total_clients: int
    total_pipeline_value: float
    conversion_rate: float
    stages: List[StageMetric]
    recent_leads: List[LeadResponse]
    recent_clients: List[ClientResponse]
