import { createClient } from "redis";

export const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    reconnectStrategy: (retries) => {
      // Exponential backoff up to 3 seconds
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("error", (err) => {
  console.warn("[Redis Warning] Socket notice (reconnecting):", err?.message || err);
});

export const redisConnection = async () => {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Redis connection error 😭", error);
  }
};
