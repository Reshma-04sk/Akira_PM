import logging
import sys
from src.core.settings import settings

def setup_logging() -> None:
    """
    Sets up global logging levels and formats.
    Provides standard clean console output for development, and respects BACKEND_LOG_LEVEL.
    """
    log_level = getattr(logging, settings.BACKEND_LOG_LEVEL.upper(), logging.INFO)
    
    # Log message format
    log_format = "%(asctime)s [%(levelname)s] %(name)s - %(filename)s:%(lineno)d - %(message)s"
    
    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True
    )
    
    # Restrict noise from third-party loggers
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("alembic").setLevel(logging.INFO)
    
    logger = logging.getLogger("saas_backend")
    logger.info("Logging initialized with level: %s", settings.BACKEND_LOG_LEVEL.upper())
