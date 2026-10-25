import { RedisClientType } from "redis";
import { redisClient as defaultRedisClient } from "../../database/redis.connection";

export class RedisService {
  private redisClient: RedisClientType;
  private readonly SOCKET_PREFIX = "socket:";

  constructor(client?: RedisClientType) {
    this.redisClient = client || (defaultRedisClient as unknown as RedisClientType);
  }

  async redisConnection(): Promise<void> {
    try {
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
        console.log("Redis connected successfully");
      }
    } catch (error) {
      console.error("Redis connection error:", error);
    }
  }

  key(userId: string): string {
    return `${this.SOCKET_PREFIX}${userId}`;
  }

  async saveUserSocket(userId: string, socketId: string): Promise<void> {
    await this.redisClient.sAdd(this.key(userId), socketId);
  }

  async getUserSockets(userId: string): Promise<string[]> {
    return this.redisClient.sMembers(this.key(userId));
  }

  async removeUserSocket(userId: string, socketId: string): Promise<void> {
    await this.redisClient.sRem(this.key(userId), socketId);
  }

  async hasSockets(userId: string): Promise<number> {
    return this.redisClient.sCard(this.key(userId));
  }

  async removeUser(userId: string): Promise<void> {
    await this.redisClient.del(this.key(userId));
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await this.redisClient.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async del(key: string): Promise<number> {
    return this.redisClient.del(key);
  }

  async hset(hash: string, key: string, value: string): Promise<number> {
    return this.redisClient.hSet(hash, key, value);
  }

  async hget(hash: string, key: string): Promise<string | null> {
    return this.redisClient.hGet(hash, key);
  }

  async hdel(hash: string, key: string): Promise<number> {
    return this.redisClient.hDel(hash, key);
  }
}

export const redisService = new RedisService();
