from uuid import UUID

from src.core.exceptions import NotFoundException
from src.models.user import User
from src.repositories.user_repository import UserRepository


class UserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    async def get_user_by_id(self, user_id: UUID) -> User:
        user = await self.user_repository.get_by_id(user_id)
        if not user:
            raise NotFoundException("User not found")
        return user

    async def get_user_by_email(self, email: str) -> User:
        user = await self.user_repository.get_by_email(email)
        if not user:
            raise NotFoundException("User not found")
        return user
