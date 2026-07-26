from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.dependencies.auth import get_current_active_user
from src.dependencies.database import get_db_session
from src.models.user import User
from src.repositories.comment_repository import CommentRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.schemas.response import APIResponse
from src.schemas.search import SearchResultsResponse
from src.services.search_service import SearchService

router = APIRouter()


def get_search_service(
    db: AsyncSession = Depends(get_db_session),  # noqa: B008
) -> SearchService:
    project_repo = ProjectRepository(db)
    task_repo = TaskRepository(db)
    comment_repo = CommentRepository(db)
    return SearchService(project_repo, task_repo, comment_repo)


@router.get("", response_model=APIResponse[SearchResultsResponse])
async def search(
    q: str = Query(default="", description="Search query string"),  # noqa: B008
    page: int = Query(default=1, ge=1),  # noqa: B008
    page_size: int = Query(default=20, ge=1, le=100),  # noqa: B008
    current_user: User = Depends(get_current_active_user),  # noqa: B008
    service: SearchService = Depends(get_search_service),  # noqa: B008
) -> APIResponse[SearchResultsResponse]:
    """
    Performs global search across user projects, tasks, and comments.
    """
    results = await service.search(current_user.id, q, page, page_size)
    return APIResponse(data=results)
