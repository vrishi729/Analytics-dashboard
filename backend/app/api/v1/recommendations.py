import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.recommendations import generate_recommendations
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User

router = APIRouter(prefix='/recommendations', tags=['recommendations'])


@router.get('/')
async def get_recommendations(
    dataset_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    did = uuid.UUID(dataset_id) if dataset_id else None
    return await generate_recommendations(db, current_user.id, did)
