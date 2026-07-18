from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings

connect_args = {}
if settings.database_url.startswith('sqlite'):
    connect_args['check_same_thread'] = False

engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    connect_args=connect_args,
)
async_session_factory = async_sessionmaker(engine, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession]:
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
