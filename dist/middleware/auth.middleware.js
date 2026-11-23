"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_service_1 = require("../config/env.service");
const error_response_1 = require("../common/response/error.response");
const redis_connection_1 = require("../database/redis.connection");
const user_model_1 = require("../database/model/user.model");
const authMiddleware = (token) => {
    return async (req, res, next) => {
        try {
            let accessToken;
            if (req.headers.authorization &&
                req.headers.authorization.startsWith("Bearer")) {
                accessToken = req.headers.authorization.split(" ")[1];
            }
            if (!accessToken) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            const decoded = jsonwebtoken_1.default.verify(accessToken, env_service_1.env.JWT_SECRET_LOGIN);
            const userId = decoded.id || decoded._id;
            if (!userId) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            const isTokenBlacklisted = await redis_connection_1.redisClient.get(`blacklist:${userId}`);
            if (isTokenBlacklisted) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            const user = await user_model_1.User.findById(userId);
            if (!user) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            req.user = user;
            next();
        }
        catch (error) {
            if (error instanceof error_response_1.UnauthorizedError) {
                return next(error);
            }
            if (error?.name === "TokenExpiredError") {
                return next(new error_response_1.UnauthorizedError("Token expired. Please login again."));
            }
            if (error?.name === "JsonWebTokenError") {
                return next(new error_response_1.UnauthorizedError("Invalid authentication token"));
            }
            return next(new error_response_1.UnauthorizedError(error?.message || "Unauthorized"));
        }
    };
};
exports.authMiddleware = authMiddleware;
const authorization = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const role = req.user?.role;
            if (!role) {
                throw new error_response_1.UnauthorizedError("Please login first");
            }
            if (!allowedRoles.includes(role)) {
                throw new error_response_1.UnauthorizedError("Forbidden: Insufficient permissions");
            }
            next();
        }
        catch (error) {
            if (error instanceof error_response_1.UnauthorizedError) {
                return next(error);
            }
            return next(new error_response_1.UnauthorizedError(error?.message || "Forbidden"));
        }
    };
};
exports.authorization = authorization;
