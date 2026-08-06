import logging
import time
import uuid
from contextlib import asynccontextmanager

import sentry_sdk
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse, Response
from sqlalchemy import text

from src.api.v1.router import api_router
from src.core.database import async_session_maker
from src.core.exceptions import AppException
from src.core.handlers import (
    app_exception_handler,
    general_exception_handler,
    validation_exception_handler,
)
from src.core.logging import correlation_id_var, request_id_var, setup_logging
from src.core.redis import redis_cache
from src.core.settings import settings

# Initialize central logging configuration
setup_logging()
logger = logging.getLogger("saas_backend")

# Initialize Sentry SDK
if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        traces_sample_rate=1.0,
        environment=settings.ENV_STATE,
    )
    logger.info("Sentry instrumentation initialized successfully.")

# Metrics and tracing state
START_TIME = time.time()
METRICS = {
    "requests_total": 0,
    "requests_errors": 0,
}


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

# Enable Gzip compression for response payloads above 1000 bytes
app.add_middleware(GZipMiddleware, minimum_size=1000)


@app.middleware("http")
async def request_id_and_metrics_middleware(request: Request, call_next):
    req_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    corr_id = request.headers.get("X-Correlation-ID") or req_id
    request_id_var.set(req_id)
    correlation_id_var.set(corr_id)

    is_infra_route = request.url.path in [
        "/metrics",
        "/health",
        "/ready",
        "/readiness",
        "/live",
        "/liveness",
    ]
    if not is_infra_route:
        METRICS["requests_total"] += 1

    try:
        response = await call_next(request)
        if not is_infra_route and response.status_code >= 400:
            METRICS["requests_errors"] += 1
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Correlation-ID"] = corr_id
        return response
    except Exception:
        if not is_infra_route:
            METRICS["requests_errors"] += 1
        raise


@app.get("/health", status_code=200)
@app.get("/live", status_code=200)
@app.get("/liveness", status_code=200)
async def liveness_check():
    return {"status": "ok"}


@app.get("/ready", status_code=200)
@app.get("/readiness", status_code=200)
async def readiness_check():
    try:
        async with async_session_maker() as session:
            await session.execute(text("SELECT 1"))
    except Exception as e:
        logger.error("Readiness check failed - Database connectivity issue: %s", str(e))
        return JSONResponse(
            status_code=503,
            content={"status": "unready", "details": {"database": "disconnected"}},
        )

    if redis_cache.redis_pool:
        try:
            async with await redis_cache.get_client() as client:
                await client.ping()
        except Exception as e:
            logger.error("Readiness check failed - Redis connectivity issue: %s", str(e))
            return JSONResponse(
                status_code=503,
                content={"status": "unready", "details": {"redis": "disconnected"}},
            )

    return {"status": "ready"}


@app.get("/metrics")
async def metrics_endpoint():
    uptime = time.time() - START_TIME
    lines = [
        f"akira_pm_uptime_seconds {uptime}",
        f"akira_pm_requests_total {METRICS['requests_total']}",
        f"akira_pm_requests_errors {METRICS['requests_errors']}",
    ]
    return Response(content="\n".join(lines) + "\n", media_type="text/plain")


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
    if not any(
        request.url.path.startswith(p) for p in ["/docs", "/redoc", "/openapi.json"]
    ):
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; frame-ancestors 'none'; sandbox;"
        )
    else:
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data: https://fastapi.tiangolo.com;"
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
