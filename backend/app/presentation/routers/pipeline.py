"""
Pipeline Stages Router (/api/v1/pipeline-stages).
Provides stage definitions for the Kanban pipeline.
"""
from typing import Annotated, List
from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.infrastructure.models import PipelineStage, User
from app.presentation.deps import get_current_user
from app.presentation.schemas.auth import PipelineStageResponse

router = APIRouter(prefix="/pipeline-stages", tags=["Kanban Pipeline Stages"])


@router.get(
    "",
    response_model=List[PipelineStageResponse],
    status_code=status.HTTP_200_OK,
    summary="List Kanban pipeline stages for the current tenant"
)
async def list_pipeline_stages(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)]
):
    result = await db.execute(
        select(PipelineStage)
        .where(PipelineStage.tenant_id == current_user.tenant_id)
        .order_by(PipelineStage.position.asc())
    )
    stages = result.scalars().all()
    return [PipelineStageResponse.model_validate(s) for s in stages]
