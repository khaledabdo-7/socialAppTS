"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = require("express-rate-limit");
const helmet_1 = __importDefault(require("helmet"));
const env_service_1 = require("./config/env.service");
const mongo_connection_1 = require("./database/mongo.connection");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = env_service_1.env.PORT;
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: "*",
    }));
    const limiter = (0, express_rate_limit_1.rateLimit)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100, // Limit each IP to 100 requests per window
        standardHeaders: "draft-8", // Return rate limit info in headers
        legacyHeaders: false, // Disable the X-RateLimit-* headers
    });
    app.use(limiter);
    app.use((0, helmet_1.default)());
    (0, mongo_connection_1.connectDB)();
    app.listen(port, () => {
        console.log(`Server is running in port ${port}`);
    });
};
exports.bootstrap = bootstrap;
