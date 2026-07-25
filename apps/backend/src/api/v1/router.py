from fastapi import APIRouter

from src.api.v1.audit_log.router import router as audit_log_router
from src.api.v1.auth.router import router as auth_router
from src.api.v1.health.router import router as health_router
from src.api.v1.projects.router import router as project_router
from src.api.v1.tasks.router import router as task_router

api_router = APIRouter()

# Register sub-routers under /api/v1
api_router.include_router(health_router, prefix="/health", tags=["Health Checks"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(audit_log_router, prefix="/audit-logs", tags=["Audit Logs"])
api_router.include_router(project_router, prefix="/projects", tags=["Projects"])
api_router.include_router(task_router, prefix="/tasks", tags=["Tasks"])
