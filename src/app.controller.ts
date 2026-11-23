import express from "express";
import type { Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import helmet from "helmet";
import { env } from "./config/env.service";
import { connectDB } from "./database/mongo.connection";
import { globalErrorHandler } from "./middleware/globalErrorHandler.middleware";
import authRouter from "./module/auth/auth.controller";
import { redisConnection } from "./database/redis.connection";
import rateLimiter from "./middleware/rateLimit.middleware";
import postRouter from "./module/post/post.controller";
import commentRouter from "./module/comment/comment.controller";
import userRouter from "./module/user/user.controller";
import friendRouter from "./module/friend/friend.controller";
import chatRouter from "./module/chat/chat.controller";
import notificationRouter from "./module/notification/notification.controller";
import uploadRouter from "./module/upload/upload.controller";
import { createHandler } from "graphql-http/lib/use/express";
import { schema } from "./module/gql/schema.gql";
import { realtimeGateway } from "./module/realtime/realtime.gateway";

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = env.PORT;

  app.use(express.json());
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  const limiter = rateLimiter(15 * 60 * 1000, 1000);
  app.use(limiter);
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  await connectDB();
  await redisConnection();

  // Serve static uploads with subdirectories
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  for (const sub of ["profiles", "posts", "general"]) {
    const subPath = path.join(uploadsDir, sub);
    if (!fs.existsSync(subPath)) {
      fs.mkdirSync(subPath, { recursive: true });
    }
  }
  app.use("/uploads", express.static(uploadsDir));

  app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.all(
    "/graphql",
    createHandler({ schema: schema, context: (req) => ({ req }) }),
  );
  app.use("/auth", authRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/user", userRouter);
  app.use("/friend", friendRouter);
  app.use("/chat", chatRouter);
  app.use("/notification", notificationRouter);
  app.use("/upload", uploadRouter);
  app.use(globalErrorHandler);

  const httpServer = app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running in port ${port}`);
  });

  realtimeGateway.initializer(httpServer);
};
