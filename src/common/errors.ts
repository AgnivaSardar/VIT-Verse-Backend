export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean = true;
    public readonly details?: any;

 constructor(message: string, statusCode = 500, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message = "ValidationError", details?: unknown) {
    super(message, 400, details);
  }
}

export class AuthError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

