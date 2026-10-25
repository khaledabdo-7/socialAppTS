import jwt from "jsonwebtoken";
import { env } from "../../config/env.service";
import { UnauthorizedError } from "../../common/response/error.response";
import { redisClient } from "../../database/redis.connection";
import { User } from "../../database/model/user.model";
import { TypedSocket } from "./realtime.interface";
import { CustomJwtPayload } from "../../common/interface/user.interface";

export const socketAuthMiddleware = async (
  socket: TypedSocket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    const rawToken =
      socket.handshake.auth?.token ||
      socket.handshake.auth?.authorization ||
      socket.handshake.headers?.authorization ||
      (socket.handshake.query?.token as string | undefined);

    if (!rawToken || typeof rawToken !== "string") {
      return next(new UnauthorizedError("Authentication token is required"));
    }

    const token = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7).trim()
      : rawToken.trim();

    if (!token) {
      return next(new UnauthorizedError("Malformed authentication token"));
    }

    let decoded: CustomJwtPayload;
    try {
      decoded = jwt.verify(
        token,
        env.JWT_SECRET_LOGIN,
      ) as CustomJwtPayload;
    } catch (jwtErr: any) {
      return next(
        new UnauthorizedError(jwtErr.message || "Invalid or expired token"),
      );
    }

    if (!decoded || !decoded.id) {
      return next(new UnauthorizedError("Invalid token payload"));
    }

    const isTokenBlacklisted = await redisClient.get(`blacklist:${decoded.id}`);
    if (isTokenBlacklisted) {
      return next(new UnauthorizedError("Session has been revoked"));
    }

    if (decoded.jwtid) {
      const isAccessTokenRevoked = await redisClient.get(
        `accessToken:${decoded.jwtid}`,
      );
      if (isAccessTokenRevoked) {
        return next(new UnauthorizedError("Access token has been revoked"));
      }
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new UnauthorizedError("User does not exist"));
    }

    if (user.isDeactivated) {
      return next(new UnauthorizedError("User account has been deactivated"));
    }

    socket.data.user = user;
    socket.data.userId = (user as any)._id?.toString() || user.id || decoded.id;
    socket.data.role = user.role;

    return next();
  } catch (error: any) {
    console.error("[SocketAuthMiddleware] Authentication error:", error);
    return next(
      new UnauthorizedError(error.message || "Socket authentication failed"),
    );
  }
};
