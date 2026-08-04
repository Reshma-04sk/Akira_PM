from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

from src.api.v1.router import api_router
from src.core.exceptions import AppException
from src.core.handlers import (
    app_exception_handler,
    general_exception_handler,
    validation_exception_handler,
)
from src.core.logging import setup_logging
from src.core.redis import redis_cache
from src.core.settings import settings

# Initialize central logging configuration
setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup lifecycle hooks:
    redis_cache.initialize()
    yield
    # Shutdown lifecycle hooks:
    if redis_cache.redis_pool:
        await redis_cache.redis_pool.disconnect()


# Instantiate FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Production-grade SaaS Platform Core API",
    version="1.0.0",
    docs_url="/docs" if settings.ENV_STATE != "production" else None,
    redoc_url="/redoc" if settings.ENV_STATE != "production" else None,
    openapi_url="/openapi.json" if settings.ENV_STATE != "production" else None,
    lifespan=lifespan,
)

# Configure CORS middleware mapping
# Allowed origins will restrict to exact matches in production setups
if settings.ENV_STATE == "development":
    allowed_origins = ["*"]
else:
    allowed_origins = settings.CORS_ALLOWED_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Protect against HTTP Host Header attacks in production
if settings.ENV_STATE == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )


@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Content-Security-Policy"] = (
        "default-src 'none'; frame-ancestors 'none'; sandbox;"
    )
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Permissions-Policy"] = (
        "accelerometer=(), camera=(), gyroscope=(), microphone=(), "
        "magnetometer=(), payment=(), usb=()"
    )
    if settings.ENV_STATE == "production":
        response.headers["Strict-Transport-Security"] = (
            "max-age=63072000; includeSubDomains; preload"
        )
    return response


# Bind global exception handlers
app.add_exception_handler(AppException, app_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

# Register versioned API router prefix
app.include_router(api_router, prefix="/api/v1")
