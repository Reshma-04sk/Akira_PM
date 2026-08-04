from fastapi import APIRouter

from src.api.v1.ai.router import router as ai_router
from src.api.v1.attachments.router import router as attachments_router
from src.api.v1.audit_log.router import router as audit_log_router
from src.api.v1.auth.router import router as auth_router
from src.api.v1.comments.router import router as comments_router
from src.api.v1.dashboard.router import router as dashboard_router
from src.api.v1.health.router import router as health_router
from src.api.v1.notifications.router import router as notifications_router
from src.api.v1.project_members.router import router as project_member_router
from src.api.v1.projects.router import router as project_router
from src.api.v1.search.router import router as search_router
from src.api.v1.tasks.router import router as task_router
from src.api.v1.users.router import router as users_router
from src.api.v1.workspaces.router import router as workspaces_router

api_router = APIRouter()

# Register sub-routers under /api/v1
api_router.include_router(health_router, prefix="/health", tags=["Health Checks"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(audit_log_router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(project_router, prefix="/projects", tags=["Projects"])
api_router.include_router(task_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(
    project_member_router, prefix="/project-members", tags=["Project Members"]
)
api_router.include_router(comments_router, prefix="/comments", tags=["Comments"])
api_router.include_router(
    notifications_router, prefix="/notifications", tags=["Notifications"]
)
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(search_router, prefix="/search", tags=["Search"])
api_router.include_router(
    attachments_router, prefix="/attachments", tags=["Attachments"]
)
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(workspaces_router, prefix="/workspaces", tags=["Workspaces"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Infrastructure"])
