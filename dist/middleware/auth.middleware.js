"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_service_1 = require("../config/env.service");
const error_response_1 = require("../common/response/error.response");
const redis_connection_1 = require("../database/redis.connection");
const user_model_1 = require("../model/user.model");
const error_response_2 = require("../common/response/error.response");
const authMiddleware = () => {
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
            const isTokenBlacklisted = await redis_connection_1.redisClient.get(`blacklist:${decoded.id}`);
            if (isTokenBlacklisted) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            const user = await user_model_1.User.findById(decoded.id);
            if (!user) {
                throw new error_response_1.UnauthorizedError("Unauthorized");
            }
            req.user = user;
            next();
        }
        catch (error) {
            throw new error_response_2.InternalServerError("Internal server error");
        }
    };
};
