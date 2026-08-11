"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const rateLimiter = (windowMs, limit) => {
    return (0, express_rate_limit_1.default)({
        windowMs,
        limit, // Limit each IP to 100 requests per window
        standardHeaders: "draft-8", // Return rate limit info in headers
        legacyHeaders: false, // Disable the X-RateLimit-* headers
    });
};
exports.default = rateLimiter;
