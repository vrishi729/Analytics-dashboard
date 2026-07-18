from collections.abc import AsyncGenerator

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import NullPool
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.database import get_db
from app.main import app
from app.models import Base

test_database_url = settings.database_url

engine = create_async_engine(test_database_url, poolclass=NullPool)
test_async_session = async_sessionmaker(engine, expire_on_commit=False)


@pytest.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def override_get_db() -> AsyncGenerator[AsyncSession]:
    async with test_async_session() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession]:
    async with test_async_session() as session:
        yield session


@pytest.fixture
async def auth_headers(client: AsyncClient) -> dict[str, str]:
    await client.post(
        '/api/v1/auth/register',
        json={'email': 'test@example.com', 'password': 'testpass123'},
    )
    resp = await client.post(
        '/api/v1/auth/login',
        json={'email': 'test@example.com', 'password': 'testpass123'},
    )
    token = resp.json()['access_token']
    return {'Authorization': f'Bearer {token}'}
