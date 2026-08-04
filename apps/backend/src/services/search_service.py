from uuid import UUID

from src.repositories.comment_repository import CommentRepository
from src.repositories.project_repository import ProjectRepository
from src.repositories.task_repository import TaskRepository
from src.repositories.user_repository import UserRepository
from src.schemas.comment import CommentResponse
from src.schemas.project import ProjectResponse
from src.schemas.search import SearchResultsResponse
from src.schemas.task import TaskResponse
from src.schemas.user import UserResponse


class SearchService:
    def __init__(
        self,
        project_repository: ProjectRepository,
        task_repository: TaskRepository,
        comment_repository: CommentRepository,
        user_repository: UserRepository,
    ):
        self.project_repository = project_repository
        self.task_repository = task_repository
        self.comment_repository = comment_repository
        self.user_repository = user_repository

    async def search(
        self, user_id: UUID, query_str: str, page: int = 1, page_size: int = 20
    ) -> SearchResultsResponse:
        if not query_str.strip():
            return SearchResultsResponse(projects=[], tasks=[], comments=[], users=[])

        offset = (page - 1) * page_size

        # Find all project IDs user is involved in
        project_ids = await self.project_repository.get_user_involved_project_ids(
            user_id
        )

        projects = await self.project_repository.search_involved_projects(
            user_id=user_id,
            query_str=query_str,
            limit=page_size,
            offset=offset,
        )

        tasks = await self.task_repository.search_involved_tasks(
            project_ids=project_ids,
            query_str=query_str,
            limit=page_size,
            offset=offset,
        )

        comments = await self.comment_repository.search_involved_comments(
            project_ids=project_ids,
            query_str=query_str,
            limit=page_size,
            offset=offset,
        )

        users = await self.user_repository.search_users(
            query_str=query_str,
            limit=page_size,
            offset=offset,
        )

        return SearchResultsResponse(
            projects=[ProjectResponse.model_validate(p) for p in projects],
            tasks=[TaskResponse.model_validate(t) for t in tasks],
            comments=[CommentResponse.model_validate(c) for c in comments],
            users=[UserResponse.model_validate(u) for u in users],
        )
