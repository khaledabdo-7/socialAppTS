import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.service";
import { UnauthorizedError } from "../common/response/error.response";
import { redisClient } from "../database/redis.connection";
import { User } from "../model/user.model";
import { InternalServerError } from "../common/response/error.response";

const authMiddleware = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let accessToken;
      if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
      ) {
        accessToken = req.headers.authorization.split(" ")[1];
      }
      if (!accessToken) {
        throw new UnauthorizedError("Unauthorized");
      }
      const decoded = jwt.verify(accessToken, env.JWT_SECRET_LOGIN) as {
        id: string;
      };
      const isTokenBlacklisted = await redisClient.get(
        `blacklist:${decoded.id}`,
      );
      if (isTokenBlacklisted) {
        throw new UnauthorizedError("Unauthorized");
      }
      const user = await User.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedError("Unauthorized");
      }
      (req as any).user = user;
      next();
    } catch (error) {
      throw new InternalServerError("Internal server error");
    }
  };
};
