import { NotAuthorizedError } from "../common/response/error.response";
import { env } from "../config/env.service";
import jwt from "jsonwebtoken";
import { redisClient } from "../database/redis.connection";
import { User } from "../database/model/user.model";

export const graphQLAuthMiddleware = async (context: any) => {
  const authHeader = context.req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new NotAuthorizedError("Not authorized");
  }
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, env.JWT_SECRET_LOGIN) as {
    id?: string;
    _id?: string;
  };
  const userId = decodedToken.id || decodedToken._id;
  if (!userId) {
    throw new NotAuthorizedError("Not authorized");
  }
  const isTokenBlacklisted = await redisClient.get(
    `blacklist:${userId}`,
  );
  if (isTokenBlacklisted) {
    throw new NotAuthorizedError("Not authorized");
  }
  const user = await User.findById(userId);
  if (!user) {
    throw new NotAuthorizedError("Not authorized");
  }
  context.user = user;
  return user;
};
