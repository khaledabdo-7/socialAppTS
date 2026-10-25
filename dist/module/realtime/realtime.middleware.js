"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_service_1 = require("../../config/env.service");
const error_response_1 = require("../../common/response/error.response");
const redis_connection_1 = require("../../database/redis.connection");
const user_model_1 = require("../../database/model/user.model");
const socketAuthMiddleware = async (socket, next) => {
    try {
        const rawToken = socket.handshake.auth?.token ||
            socket.handshake.auth?.authorization ||
            socket.handshake.headers?.authorization ||
            socket.handshake.query?.token;
        if (!rawToken || typeof rawToken !== "string") {
            return next(new error_response_1.UnauthorizedError("Authentication token is required"));
        }
        const token = rawToken.startsWith("Bearer ")
            ? rawToken.slice(7).trim()
            : rawToken.trim();
        if (!token) {
            return next(new error_response_1.UnauthorizedError("Malformed authentication token"));
        }
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, env_service_1.env.JWT_SECRET_LOGIN);
        }
        catch (jwtErr) {
            return next(new error_response_1.UnauthorizedError(jwtErr.message || "Invalid or expired token"));
        }
        if (!decoded || !decoded.id) {
            return next(new error_response_1.UnauthorizedError("Invalid token payload"));
        }
        const isTokenBlacklisted = await redis_connection_1.redisClient.get(`blacklist:${decoded.id}`);
        if (isTokenBlacklisted) {
            return next(new error_response_1.UnauthorizedError("Session has been revoked"));
        }
        if (decoded.jwtid) {
            const isAccessTokenRevoked = await redis_connection_1.redisClient.get(`accessToken:${decoded.jwtid}`);
            if (isAccessTokenRevoked) {
                return next(new error_response_1.UnauthorizedError("Access token has been revoked"));
            }
        }
        const user = await user_model_1.User.findById(decoded.id).select("-password");
        if (!user) {
            return next(new error_response_1.UnauthorizedError("User does not exist"));
        }
        if (user.isDeactivated) {
            return next(new error_response_1.UnauthorizedError("User account has been deactivated"));
        }
        socket.data.user = user;
        socket.data.userId = user._id?.toString() || user.id || decoded.id;
        socket.data.role = user.role;
        return next();
    }
    catch (error) {
        console.error("[SocketAuthMiddleware] Authentication error:", error);
        return next(new error_response_1.UnauthorizedError(error.message || "Socket authentication failed"));
    }
};
exports.socketAuthMiddleware = socketAuthMiddleware;
