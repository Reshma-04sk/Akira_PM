from pydantic import BaseModel, Field

from src.schemas.user import UserResponse


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = Field(default="bearer")
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str
