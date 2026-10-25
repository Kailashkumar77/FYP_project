"""
Dashboard Router (/api/v1/dashboard).
Calculates and returns live database-backed business indicators.
"""
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.application.crm_service import CRMService
from app.db.session import get_db
from app.infrastructure.models import User
from app.presentation.deps import get_current_user
from app.presentation.schemas.crm import DashboardMetricsResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Analytics"])


@router.get(
    "/metrics",
    response_model=DashboardMetricsResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve live database-backed metrics for the CRM dashboard"
)
async def get_dashboard_metrics(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    service = CRMService(db, current_user)
    return await service.get_dashboard_metrics()
