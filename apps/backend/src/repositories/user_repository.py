from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.user import User
from src.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, session: AsyncSession):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        statement = select(User).where(User.email == email.lower().strip())
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def search_users(
        self, query_str: str, limit: int = 20, offset: int = 0
    ) -> list[User]:
        statement = (
            select(User)
            .where(
                User.email.ilike(f"%{query_str.strip()}%")
                | User.full_name.ilike(f"%{query_str.strip()}%")
            )
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.execute(statement)
        return list(result.scalars().all())
