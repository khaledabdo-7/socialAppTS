export class ApplicationError extends Error {
    public statusCode: number;
  constructor(message: string, statusCode: number,cause?: any) {
    super(message);
    this.name = "ApplicationError";
    this.statusCode = statusCode;
    this.cause = cause;
  }
}

export class BadRequestError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 400, cause);
    this.name = "BadRequestError";
  }
}
export class UnauthorizedError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 401, cause);
    this.name = "UnauthorizedError";
  }
}   
export class ForbiddenError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 403, cause);
    this.name = "ForbiddenError";
  }
}           

export class NotFoundError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 404, cause);
    this.name = "NotFoundError";
  }
}   
export class ConflictError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 409, cause);
    this.name = "ConflictError";
  }
}   
export class InternalServerError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 500, cause);
    this.name = "InternalServerError";
  }
}   

export class ValidationError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 422, cause);
    this.name = "ValidationError";
  }
}

export class UnauthenticatedError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 401, cause);
    this.name = "UnauthenticatedError";
  }
}   

export class NotAuthenticatedError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 403, cause);
    this.name = "NotAuthenticatedError";
  }
}

export class NotAuthorizedError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 403, cause);
    this.name = "NotAuthorizedError";
  }
}   


export class UserNotFoundError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 404, cause);
    this.name = "UserNotFoundError";
  }
}       


export class PostNotFoundError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 404, cause);
    this.name = "PostNotFoundError";
  }
}   


export class CommentNotFoundError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 404, cause);
    this.name = "CommentNotFoundError";
  }
}   

export class LikeNotFoundError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 404, cause);
    this.name = "LikeNotFoundError";
  }
}   


export class UserAlreadyExistsError extends ApplicationError {
  constructor(message: string, cause?: any) {
    super(message, 409, cause);
    this.name = "UserAlreadyExistsError";
  }
}
