import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.service";
import { UnauthorizedError } from "../common/response/error.response";
import { redisClient } from "../database/redis.connection";
import { User } from "../database/model/user.model";
import { BadRequestError } from "../common/response/error.response";
import { CustomJwtPayload } from "../common/interface/user.interface";
import { UserReq } from "../common/interface/userReq.interface";

export const authMiddleware = (token?: string) => {
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
        id?: string;
        _id?: string;
      };
      const userId = decoded.id || decoded._id;
      if (!userId) {
        throw new UnauthorizedError("Unauthorized");
      }
      const isTokenBlacklisted = await redisClient.get(
        `blacklist:${userId}`,
      );
      if (isTokenBlacklisted) {
        throw new UnauthorizedError("Unauthorized");
      }
      const user = await User.findById(userId);
      if (!user) {
        throw new UnauthorizedError("Unauthorized");
      }
      (req as UserReq).user = user;
      next();
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        return next(error);
      }
      if (error?.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Token expired. Please login again."));
      }
      if (error?.name === "JsonWebTokenError") {
        return next(new UnauthorizedError("Invalid authentication token"));
      }
      return next(new UnauthorizedError(error?.message || "Unauthorized"));
    }
  };
};

export const authorization = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = (req as any).user?.role;
      if (!role) {
        throw new UnauthorizedError("Please login first");
      }
      if (!allowedRoles.includes(role)) {
        throw new UnauthorizedError("Forbidden: Insufficient permissions");
      }
      next();
    } catch (error: any) {
      if (error instanceof UnauthorizedError) {
        return next(error);
      }
      return next(new UnauthorizedError(error?.message || "Forbidden"));
    }
  };
};
