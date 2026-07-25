from typing import Generic, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class ErrorDetail(BaseModel):
    message: str
    field: str | None = None


class ErrorResponse(BaseModel):
    success: bool = Field(default=False)
    error: ErrorDetail


class APIResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True)
    data: T


class PaginationMetadata(BaseModel):
    total: int
    page: int
    size: int
    pages: int


class PaginatedResponse(BaseModel, Generic[T]):
    success: bool = Field(default=True)
    data: list[T]
    pagination: PaginationMetadata
