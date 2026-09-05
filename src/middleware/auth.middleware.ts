import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.service";
import { UnauthorizedError } from "../common/response/error.response";
import { redisClient } from "../database/redis.connection";
import { User } from "../database/model/user.model";
import { BadRequestError } from "../common/response/error.response";
import { CustomJwtPayload } from "../common/interface/user.interface";
import { UserReq } from "../common/interface/userReq.interface";

export const authMiddleware = () => {
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
      (req as UserReq).user = user;
      next();
    } catch (error) {
      console.error("Error in authMiddleware:", error);
      throw new BadRequestError("Something went wrong");
    }
  };
};

export const authorization = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = (req as any).user.role;
      if (!role) {
        throw new UnauthorizedError("Please login First");
      }
      if (!allowedRoles.includes(role)) {
        throw new UnauthorizedError("Unauthorized");
      }
      next();
    } catch (error) {
      throw new BadRequestError("Something went wrong");
    }
  };
};
