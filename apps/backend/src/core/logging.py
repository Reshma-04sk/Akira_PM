import json
import logging
import sys
from contextvars import ContextVar

from src.core.settings import settings

request_id_var: ContextVar[str | None] = ContextVar("request_id", default=None)
correlation_id_var: ContextVar[str | None] = ContextVar("correlation_id", default=None)


class JSONFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": self.formatTime(record, self.datefmt),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "filename": record.filename,
            "lineno": record.lineno,
        }
        req_id = request_id_var.get()
        corr_id = correlation_id_var.get()
        if req_id:
            log_entry["request_id"] = req_id
        if corr_id:
            log_entry["correlation_id"] = corr_id

        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
        return json.dumps(log_entry)


def setup_logging() -> None:
    """
    Sets up global logging levels and formats.
    Provides standard clean console output for development, and respects BACKEND_LOG_LEVEL.
    Supports structured JSON logs in production.
    """
    log_level = getattr(logging, settings.BACKEND_LOG_LEVEL.upper(), logging.INFO)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)

    # Remove existing handlers
    for handler in list(root_logger.handlers):
        root_logger.removeHandler(handler)

    console_handler = logging.StreamHandler(sys.stdout)

    if settings.ENV_STATE == "production":
        console_handler.setFormatter(JSONFormatter())
    else:
        log_format = "%(asctime)s [%(levelname)s] %(name)s - %(filename)s:%(lineno)d - %(message)s"
        console_handler.setFormatter(logging.Formatter(log_format))

    root_logger.addHandler(console_handler)

    # Restrict noise from third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("alembic").setLevel(logging.INFO)

    logger = logging.getLogger("saas_backend")
    logger.info(
        "Logging initialized with level: %s", settings.BACKEND_LOG_LEVEL.upper()
    )
