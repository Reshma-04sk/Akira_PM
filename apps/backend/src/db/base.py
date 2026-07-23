from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    """
    Unified declarative base for SQLAlchemy models.
    Provides metadata tracking for migrations autogeneration.
    """
    pass


