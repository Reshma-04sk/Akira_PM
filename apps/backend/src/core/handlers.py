import logging

from fastapi import Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.core.exceptions import AppException
from src.schemas.response import ErrorDetail, ErrorResponse

logger = logging.getLogger("saas_backend")


async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """Handles custom application exceptions."""
    logger.warning("AppException caught: %s (Status: %d)", exc.message, exc.status_code)
    error_payload = ErrorResponse(error=ErrorDetail(message=exc.message))
    return JSONResponse(status_code=exc.status_code, content=error_payload.model_dump())


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Handles request payload parsing validation anomalies."""
    logger.info("RequestValidationError caught: %s", str(exc))

    # Extract first error details
    errors = exc.errors()
    msg = "Validation error"
    field = None
    if errors:
        first_error = errors[0]
        msg = first_error.get("msg", msg)
        loc = first_error.get("loc", [])
        # Format field path (omits request section indicator like 'body' or 'query')
        field = ".".join(str(x) for x in loc[1:]) if len(loc) > 1 else None

    error_payload = ErrorResponse(error=ErrorDetail(message=msg, field=field))
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_payload.model_dump(),
    )


async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handles uncaught system exceptions."""
    logger.exception("Unhandled Exception encountered: %s", str(exc))
    error_payload = ErrorResponse(
        error=ErrorDetail(message="An unexpected system error occurred.")
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_payload.model_dump(),
    )
