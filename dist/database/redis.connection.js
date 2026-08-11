"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConnection = exports.redisClient = void 0;
const redis_1 = require("redis");
exports.redisClient = (0, redis_1.createClient)({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});
const redisConnection = async () => {
    try {
        await exports.redisClient.connect();
        console.log("Redis connected successfully 🚀");
    }
    catch (error) {
        console.log("Redis connection error 😭", error);
        process.exit(1);
    }
};
exports.redisConnection = redisConnection;
