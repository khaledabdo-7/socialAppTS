"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
        reconnectStrategy: (retries) => {
            // Exponential backoff up to 3 seconds
            return Math.min(retries * 100, 3000);
        },
    },
});
exports.redisClient.on("error", (err) => {
    console.warn("[Redis Warning] Socket notice (reconnecting):", err?.message || err);
});
const redisConnection = async () => {
    try {
        if (!exports.redisClient.isOpen) {
            await exports.redisClient.connect();
        }
    }
    catch (error) {
        console.error("Redis connection error 😭", error);
    }
};
exports.redisConnection = redisConnection;
