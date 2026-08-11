import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

export const redisConnection = async () => {
  try {
    await redisClient.connect();
    console.log("Redis connected successfully 🚀");
  } catch (error) {
    console.log("Redis connection error 😭", error);
    process.exit(1);
  }
};
