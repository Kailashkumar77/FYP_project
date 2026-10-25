"""
Core Database Models for IntelliCRM AI (Midterm Build).
Includes Tenant, User (RBAC), PipelineStage, Lead, Client, and ActivityLog.
"""
import uuid
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin


def generate_uuid() -> str:
    return str(uuid.uuid4())


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    SALES_AGENT = "SALES_AGENT"
    ACCOUNT_MANAGER = "ACCOUNT_MANAGER"


class Tenant(Base, TimestampMixin):
    __tablename__ = "tenants"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="STARTER", nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)

    # Relationships
    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    pipeline_stages: Mapped[List["PipelineStage"]] = relationship(
        "PipelineStage",
        back_populates="tenant",
        cascade="all, delete-orphan",
        order_by="PipelineStage.position"
    )
    leads: Mapped[List["Lead"]] = relationship(
        "Lead",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )
    clients: Mapped[List["Client"]] = relationship(
        "Client",
        back_populates="tenant",
        cascade="all, delete-orphan"
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(
        String(50),
        default=UserRole.SALES_AGENT.value,
        nullable=False
    )
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    failed_login_attempts: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    locked_until: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="users")
    assigned_leads: Mapped[List["Lead"]] = relationship(
        "Lead",
        back_populates="assigned_agent"
    )
    managed_clients: Mapped[List["Client"]] = relationship(
        "Client",
        back_populates="account_manager"
    )


class PipelineStage(Base, TimestampMixin):
    __tablename__ = "pipeline_stages"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_won_stage: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_lost_stage: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="pipeline_stages")
    leads: Mapped[List["Lead"]] = relationship("Lead", back_populates="pipeline_stage")

    __table_args__ = (
        UniqueConstraint("tenant_id", "name", name="uq_tenant_stage_name"),
    )


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    stage_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("pipeline_stages.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    assigned_user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    contact_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    budget: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    domain_fit: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1 to 5
    requirement_clarity: Mapped[int] = mapped_column(Integer, default=3, nullable=False)  # 1 to 5
    lead_source: Mapped[str] = mapped_column(String(100), default="Direct", nullable=False)
    stage: Mapped[str] = mapped_column(String(50), default="New", nullable=False, index=True)
    score: Mapped[float] = mapped_column(Float, default=50.0, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="leads")
    pipeline_stage: Mapped[Optional["PipelineStage"]] = relationship("PipelineStage", back_populates="leads")
    assigned_agent: Mapped[Optional["User"]] = relationship("User", back_populates="assigned_leads")
    converted_client: Mapped[Optional["Client"]] = relationship("Client", back_populates="converted_from_lead", uselist=False)


class Client(Base, TimestampMixin):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    converted_from_lead_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("leads.id", ondelete="SET NULL"),
        nullable=True
    )
    account_manager_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    primary_contact: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    contact_email: Mapped[str] = mapped_column(String(255), nullable=False)
    contact_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    industry: Mapped[str] = mapped_column(String(100), default="IT Services", nullable=False)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    churn_risk_level: Mapped[str] = mapped_column(String(50), default="LOW", nullable=False)  # LOW, MEDIUM, HIGH
    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    tenant: Mapped["Tenant"] = relationship("Tenant", back_populates="clients")
    converted_from_lead: Mapped[Optional["Lead"]] = relationship("Lead", back_populates="converted_client")
    account_manager: Mapped[Optional["User"]] = relationship("User", back_populates="managed_clients")


class ActivityLog(Base, TimestampMixin):
    __tablename__ = "activity_logs"

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=generate_uuid,
        index=True
    )
    tenant_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("tenants.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id: Mapped[Optional[str]] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # CREATE, UPDATE, DELETE, LOGIN
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # LEAD, CLIENT, USER
    entity_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=False)

    user: Mapped[Optional["User"]] = relationship("User")
