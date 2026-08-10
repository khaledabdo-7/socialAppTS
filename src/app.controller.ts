import express from "express";
import type { Express } from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.service";
import { connectDB } from "./database/mongo.connection";
import { globalErrorHandler } from "./middleware/globalErrorHandler.middleware";

export const bootstrap = async () => {
  const app: Express = express();
  const port: number = env.PORT;

  app.use(express.json());
  app.use(
    cors({
      origin: "*",
    }),
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: "draft-8", // Return rate limit info in headers
    legacyHeaders: false, // Disable the X-RateLimit-* headers
  });

  app.use(limiter);
  app.use(helmet());
  connectDB();


  app.use(globalErrorHandler);

  app.listen(port, () => {
    console.log(`Server is running in port ${port}`);
  });
};
