"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = exports.RedisService = void 0;
const redis_connection_1 = require("../../database/redis.connection");
class RedisService {
    redisClient;
    SOCKET_PREFIX = "socket:";
    constructor(client) {
        this.redisClient = client || redis_connection_1.redisClient;
    }
    async redisConnection() {
        try {
            if (!this.redisClient.isOpen) {
                await this.redisClient.connect();
                console.log("Redis connected successfully");
            }
        }
        catch (error) {
            console.error("Redis connection error:", error);
        }
    }
    key(userId) {
        return `${this.SOCKET_PREFIX}${userId}`;
    }
    async saveUserSocket(userId, socketId) {
        await this.redisClient.sAdd(this.key(userId), socketId);
    }
    async getUserSockets(userId) {
        return this.redisClient.sMembers(this.key(userId));
    }
    async removeUserSocket(userId, socketId) {
        await this.redisClient.sRem(this.key(userId), socketId);
    }
    async hasSockets(userId) {
        return this.redisClient.sCard(this.key(userId));
    }
    async removeUser(userId) {
        await this.redisClient.del(this.key(userId));
    }
    async set(key, value, ttlSeconds) {
        if (ttlSeconds) {
            await this.redisClient.set(key, value, { EX: ttlSeconds });
        }
        else {
            await this.redisClient.set(key, value);
        }
    }
    async get(key) {
        return this.redisClient.get(key);
    }
    async del(key) {
        return this.redisClient.del(key);
    }
    async hset(hash, key, value) {
        return this.redisClient.hSet(hash, key, value);
    }
    async hget(hash, key) {
        return this.redisClient.hGet(hash, key);
    }
    async hdel(hash, key) {
        return this.redisClient.hDel(hash, key);
    }
}
exports.RedisService = RedisService;
exports.redisService = new RedisService();
