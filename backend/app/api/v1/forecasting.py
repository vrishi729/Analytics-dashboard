import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.analytics.forecasting import get_or_run_forecast
from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.dataset import Dataset
from app.models.user import User

router = APIRouter(prefix='/forecast', tags=['forecast'])


@router.get('/products')
async def list_products(
    dataset_id: str | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[str]:
    from sqlalchemy import distinct
    from sqlalchemy import select as sel

    from app.models.dataset import Dataset
    from app.models.sales_record import SalesRecord

    did = dataset_id
    if not did:
        ds_result = await db.execute(
            select(Dataset)
            .where(Dataset.user_id == current_user.id, Dataset.status == 'cleaned')
            .order_by(Dataset.created_at.desc())
            .limit(1),
        )
        latest = ds_result.scalar_one_or_none()
        if latest is None:
            return []
        did = str(latest.id)

    q = sel(distinct(SalesRecord.product_name)).where(
        SalesRecord.user_id == current_user.id,
        SalesRecord.dataset_id == uuid.UUID(did),
    )

    result = await db.execute(q)
    return [row[0] for row in result.all() if row[0]]


@router.get('/run')
async def forecast(
    dataset_id: str | None = Query(None),
    product_name: str = Query(...),
    horizon: str = Query('week'),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    if horizon not in ('day', 'week', 'month'):
        raise HTTPException(
            status_code=400,
            detail='Horizon must be "day", "week", or "month"',
        )

    did = dataset_id
    if not did:
        ds_result = await db.execute(
            select(Dataset)
            .where(Dataset.user_id == current_user.id, Dataset.status == 'cleaned')
            .order_by(Dataset.created_at.desc())
            .limit(1),
        )
        latest = ds_result.scalar_one_or_none()
        if latest is None:
            raise HTTPException(status_code=404, detail='No cleaned datasets found')
        did = str(latest.id)

    ds_result = await db.execute(
        select(Dataset).where(
            Dataset.id == uuid.UUID(did),
            Dataset.user_id == current_user.id,
        ),
    )
    if ds_result.scalar_one_or_none() is None:
        raise HTTPException(status_code=404, detail='Dataset not found')

    result = await get_or_run_forecast(
        db,
        current_user.id,
        uuid.UUID(did),
        product_name,
        horizon,
    )

    if 'error' in result:
        raise HTTPException(status_code=400, detail=result['error'])

    return result
