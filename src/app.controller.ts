import express from "express";
import type { Express } from "express";
import cors from "cors";

import helmet from "helmet";
import { env } from "./config/env.service";
import { connectDB } from "./database/mongo.connection";
import { globalErrorHandler } from "./middleware/globalErrorHandler.middleware";
import authRouter from "./module/auth/auth.controller";
import { redisConnection } from "./database/redis.connection";
import rateLimiter from "./middleware/rateLimit.middleware";

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = env.PORT;

  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    }),
  );

  const limiter = rateLimiter(15 * 60 * 1000, 100);
  app.use(limiter);
  app.use(helmet());
  await connectDB();
  await redisConnection();

  app.use("/auth", authRouter);

  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
  });
};
