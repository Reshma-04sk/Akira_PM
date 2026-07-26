from pydantic import BaseModel

from src.schemas.comment import CommentResponse
from src.schemas.project import ProjectResponse
from src.schemas.task import TaskResponse


class SearchResultsResponse(BaseModel):
    projects: list[ProjectResponse]
    tasks: list[TaskResponse]
    comments: list[CommentResponse]
