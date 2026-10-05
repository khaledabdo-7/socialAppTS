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
import postRouter from "./module/post/post.controller";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./module/gql/schema.gql";

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

  app.all(
    "/graphql",
    createHandler({ schema: schema, context: (req) => ({ req }) }),
  );
  app.use("/auth", authRouter);
  app.use("/post", postRouter);
  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
  });
};
