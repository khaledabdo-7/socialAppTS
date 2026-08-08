import mongoose from "mongoose";
import { env } from "../config/env.service.js";

export const connectDB = async (): Promise<void> => {
  try {
    if (!env.mongoURL) {
      throw new Error(
        "MongoDB connection URL is missing in environment variables.",
      );
    }

    await mongoose.connect(env.mongoURL);
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
