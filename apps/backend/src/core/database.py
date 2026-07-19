from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from src.core.settings import settings

# Create database async engine
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to True for verbose SQLAlchemy queries logging
    future=True,
    pool_size=20,
    max_overflow=10
)

# Async session factory
async_session_maker = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)
