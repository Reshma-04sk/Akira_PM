from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

from src.core.settings import settings
from src.core.logging import setup_logging
from src.core.exceptions import AppException
from src.core.handlers import (
    app_exception_handler,
    validation_exception_handler,
    general_exception_handler,
)
from src.api.v1.router import api_router

# Initialize central logging configuration
setup_logging()

# Instantiate FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade SaaS Platform Core API",
    version="0.1.0",
    docs_url="/docs" if settings.ENV_STATE != "production" else None,
    redoc_url="/redoc" if settings.ENV_STATE != "production" else None,
    openapi_url="/openapi.json" if settings.ENV_STATE != "production" else None,
)

# Configure CORS middleware mapping
# Allowed origins will restrict to exact matches in production setups
allowed_origins = ["*"] if settings.ENV_STATE == "development" else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bind global exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register versioned API router prefix
app.include_router(api_router, prefix="/api/v1")
