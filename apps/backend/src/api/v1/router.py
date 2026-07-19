from fastapi import APIRouter
from src.api.v1.health.router import router as health_router
from src.api.v1.auth.router import router as auth_router

api_router = APIRouter()

# Register sub-routers under /api/v1
api_router.include_router(health_router, prefix="/health", tags=["Health Checks"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])

