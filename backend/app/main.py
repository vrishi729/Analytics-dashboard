from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.analytics import router as analytics_router
from app.api.v1.auth import router as auth_router
from app.api.v1.cleaning import router as cleaning_router
from app.api.v1.forecasting import router as forecast_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.upload import router as upload_router
from app.core.config import settings
from app.core.database import engine
from app.models import Base


@asynccontextmanager
async def lifespan(_app: FastAPI) -> Any:  # noqa: ARG001
    if settings.database_url.startswith('sqlite'):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title='DemandIQ API',
    version='0.1.0',
    docs_url='/api/docs',
    openapi_url='/api/openapi.json',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth_router, prefix='/api/v1')
app.include_router(upload_router, prefix='/api/v1')
app.include_router(cleaning_router, prefix='/api/v1')
app.include_router(analytics_router, prefix='/api/v1')
app.include_router(forecast_router, prefix='/api/v1')
app.include_router(recommendations_router, prefix='/api/v1')


@app.get('/api/v1/health')
async def health_check() -> dict[str, str]:
    return {'status': 'ok', 'service': 'demandiq-backend'}
