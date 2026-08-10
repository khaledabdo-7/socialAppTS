"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAlreadyExistsError = exports.LikeNotFoundError = exports.CommentNotFoundError = exports.PostNotFoundError = exports.UserNotFoundError = exports.NotAuthorizedError = exports.NotAuthenticatedError = exports.UnauthenticatedError = exports.ValidationError = exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    statusCode;
    constructor(message, statusCode, cause) {
        super(message);
        this.name = "ApplicationError";
        this.statusCode = statusCode;
        this.cause = cause;
    }
}
exports.ApplicationError = ApplicationError;
class BadRequestError extends ApplicationError {
    constructor(message, cause) {
        super(message, 400, cause);
        this.name = "BadRequestError";
    }
}
exports.BadRequestError = BadRequestError;
class UnauthorizedError extends ApplicationError {
    constructor(message, cause) {
        super(message, 401, cause);
        this.name = "UnauthorizedError";
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApplicationError {
    constructor(message, cause) {
        super(message, 403, cause);
        this.name = "ForbiddenError";
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends ApplicationError {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = "NotFoundError";
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends ApplicationError {
    constructor(message, cause) {
        super(message, 409, cause);
        this.name = "ConflictError";
    }
}
exports.ConflictError = ConflictError;
class InternalServerError extends ApplicationError {
    constructor(message, cause) {
        super(message, 500, cause);
        this.name = "InternalServerError";
    }
}
exports.InternalServerError = InternalServerError;
class ValidationError extends ApplicationError {
    constructor(message, cause) {
        super(message, 422, cause);
        this.name = "ValidationError";
    }
}
exports.ValidationError = ValidationError;
class UnauthenticatedError extends ApplicationError {
    constructor(message, cause) {
        super(message, 401, cause);
        this.name = "UnauthenticatedError";
    }
}
exports.UnauthenticatedError = UnauthenticatedError;
class NotAuthenticatedError extends ApplicationError {
    constructor(message, cause) {
        super(message, 403, cause);
        this.name = "NotAuthenticatedError";
    }
}
exports.NotAuthenticatedError = NotAuthenticatedError;
class NotAuthorizedError extends ApplicationError {
    constructor(message, cause) {
        super(message, 403, cause);
        this.name = "NotAuthorizedError";
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
class UserNotFoundError extends ApplicationError {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = "UserNotFoundError";
    }
}
exports.UserNotFoundError = UserNotFoundError;
class PostNotFoundError extends ApplicationError {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = "PostNotFoundError";
    }
}
exports.PostNotFoundError = PostNotFoundError;
class CommentNotFoundError extends ApplicationError {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = "CommentNotFoundError";
    }
}
exports.CommentNotFoundError = CommentNotFoundError;
class LikeNotFoundError extends ApplicationError {
    constructor(message, cause) {
        super(message, 404, cause);
        this.name = "LikeNotFoundError";
    }
}
exports.LikeNotFoundError = LikeNotFoundError;
class UserAlreadyExistsError extends ApplicationError {
    constructor(message, cause) {
        super(message, 409, cause);
        this.name = "UserAlreadyExistsError";
    }
}
exports.UserAlreadyExistsError = UserAlreadyExistsError;
