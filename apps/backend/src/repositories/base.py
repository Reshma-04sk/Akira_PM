from typing import Generic, TypeVar, Any
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.db.base import Base

ModelType = TypeVar("ModelType", bound=Base)

class BaseRepository(Generic[ModelType]):
    def __init__(self, model: type[ModelType], session: AsyncSession):
        self.model = model
        self.session = session

    async def get_by_id(self, id_val: UUID) -> ModelType | None:
        statement = select(self.model).where(self.model.id == id_val)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def create(self, attributes: dict[str, Any]) -> ModelType:
        db_obj = self.model(**attributes)
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def update(self, db_obj: ModelType, attributes: dict[str, Any]) -> ModelType:
        for field, value in attributes.items():
            if hasattr(db_obj, field):
                setattr(db_obj, field, value)
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def delete(self, db_obj: ModelType) -> None:
        await self.session.delete(db_obj)
        await self.session.flush()
