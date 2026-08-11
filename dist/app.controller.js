"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const env_service_1 = require("./config/env.service");
const mongo_connection_1 = require("./database/mongo.connection");
const globalErrorHandler_middleware_1 = require("./middleware/globalErrorHandler.middleware");
const auth_controller_1 = __importDefault(require("./module/auth/auth.controller"));
const redis_connection_1 = require("./database/redis.connection");
const rateLimit_middleware_1 = __importDefault(require("./middleware/rateLimit.middleware"));
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = env_service_1.env.PORT;
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    const limiter = (0, rateLimit_middleware_1.default)(15 * 60 * 1000, 100);
    app.use(limiter);
    app.use((0, helmet_1.default)());
    await (0, mongo_connection_1.connectDB)();
    await (0, redis_connection_1.redisConnection)();
    app.use("/auth", auth_controller_1.default);
    app.use(globalErrorHandler_middleware_1.globalErrorHandler);
    app.listen(port, () => {
        console.log(`Server is running in port ${port}`);
    });
};
exports.bootstrap = bootstrap;
