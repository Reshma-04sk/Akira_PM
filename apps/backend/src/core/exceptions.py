class AppException(Exception):
    """Base exception for all application errors."""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class NotFoundException(AppException):
    """Exception raised when a resource is not found."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=404)


class ValidationException(AppException):
    """Exception raised when payload validation fails."""

    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=422)


class UnauthorizedException(AppException):
    """Exception raised when credentials verification fails."""

    def __init__(self, message: str = "Unauthorized"):
        super().__init__(message, status_code=401)


class ForbiddenException(AppException):
    """Exception raised when operation permissions check fails."""

    def __init__(self, message: str = "Forbidden operation"):
        super().__init__(message, status_code=403)
