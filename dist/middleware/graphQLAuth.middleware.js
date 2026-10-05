"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQLAuthMiddleware = void 0;
const error_response_1 = require("../common/response/error.response");
const env_service_1 = require("../config/env.service");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_connection_1 = require("../database/redis.connection");
const user_model_1 = require("../database/model/user.model");
const graphQLAuthMiddleware = async (context) => {
    const authHeader = context.req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw new error_response_1.NotAuthorizedError("Not authorized");
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jsonwebtoken_1.default.verify(token, env_service_1.env.JWT_SECRET_LOGIN);
    const isTokenBlacklisted = await redis_connection_1.redisClient.get(`blacklist:${decodedToken.id}`);
    if (isTokenBlacklisted) {
        throw new error_response_1.NotAuthorizedError("Not authorized");
    }
    const user = await user_model_1.User.findById(decodedToken.id);
    if (!user) {
        throw new error_response_1.NotAuthorizedError("Not authorized");
    }
    context.user = user;
    return user;
};
exports.graphQLAuthMiddleware = graphQLAuthMiddleware;
