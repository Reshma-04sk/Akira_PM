export class AuthError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = "AuthError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid email or password") {
    super(message, "INVALID_CREDENTIALS");
    this.name = "InvalidCredentialsError";
  }
}

export class TokenExpiredError extends AuthError {
  constructor(message = "Session token has expired") {
    super(message, "TOKEN_EXPIRED");
    this.name = "TokenExpiredError";
  }
}

export class NetworkError extends AuthError {
  constructor(message = "Network error. Please try again.") {
    super(message, "NETWORK_ERROR");
    this.name = "NetworkError";
  }
}
