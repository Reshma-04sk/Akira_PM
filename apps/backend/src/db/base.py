from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Unified declarative base for SQLAlchemy models.
    Provides metadata tracking for migrations autogeneration.
    """
    pass

# Import all models to ensure metadata registration
from src.models.user import User  # noqa: F401, E402
from src.models.refresh_token import RefreshToken  # noqa: F401, E402

