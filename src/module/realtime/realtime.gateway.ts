import { Server as SocketIOServer } from "socket.io";
import type { Server as HttpServer } from "http";
import { InternalServerError } from "../../common/response/error.response";
import { RedisService, redisService } from "../../common/services/redis.service";
import { socketAuthMiddleware } from "./realtime.middleware";
import { realtimeChatGateway } from "../chat/realtime/realtimeChat.gateway";
import {
  TypedServer,
  TypedSocket,
  ServerToClientEvents,
} from "./realtime.interface";

class RealtimeGateway {
  private io: TypedServer | null = null;
  private redisService: RedisService;

  constructor(customRedisService?: RedisService) {
    this.redisService = customRedisService || redisService;
  }

  public initializer(httpServer: HttpServer): TypedServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
      transports: ["websocket", "polling"],
    }) as TypedServer;

    this.io.use(socketAuthMiddleware);

    this.io.engine.on("connection_error", (err) => {
      console.error("[Socket.IO Engine] Connection error:", {
        code: err.code,
        message: err.message,
        context: err.context,
      });
    });

    this.io.on("connection", async (socket: TypedSocket) => {
      const userId = socket.data.userId;
      console.log(`[Socket.IO] Client connected: socketId=${socket.id}, userId=${userId}`);

      socket.join(`user:${userId}`);

      try {
        await this.redisService.saveUserSocket(userId, socket.id);
        const activeSockets = await this.redisService.hasSockets(userId);
        if (activeSockets === 1) {
          socket.broadcast.emit("userOnline", { userId });
        }
      } catch (redisErr) {
        console.error("[Socket.IO] Failed to track socket in Redis:", redisErr);
      }

      socket.emit("connected", {
        socketId: socket.id,
        userId,
        message: "Connected to realtime gateway successfully",
      });

      realtimeChatGateway.register(socket, this.io!);

      socket.on("error", (error) => {
        console.error(`[Socket.IO] Socket error (${socket.id}):`, error);
      });

      socket.on("disconnect", async (reason) => {
        console.log(
          `[Socket.IO] Client disconnected: socketId=${socket.id}, userId=${userId}, reason=${reason}`,
        );
        try {
          await this.redisService.removeUserSocket(userId, socket.id);
          const remainingSockets = await this.redisService.hasSockets(userId);
          if (remainingSockets === 0) {
            socket.broadcast.emit("userOffline", { userId });
          }
        } catch (redisErr) {
          console.error("[Socket.IO] Failed to remove socket from Redis:", redisErr);
        }
      });
    });

    console.log("[Socket.IO] Realtime Gateway initialized successfully");
    return this.io;
  }

  public getIO(): TypedServer {
    if (!this.io) {
      throw new InternalServerError(
        "Socket.IO server has not been initialized yet. Call initializer() first.",
      );
    }
    return this.io;
  }

  public emitToUser<K extends keyof ServerToClientEvents>(
    userId: string,
    event: K,
    data: Parameters<ServerToClientEvents[K]>[0],
  ): boolean;
  public emitToUser(userId: string, event: string, ...args: any[]): boolean;
  public emitToUser(userId: string, event: string, ...args: any[]): boolean {
    const io = this.getIO();
    return io.to(`user:${userId}`).emit(event as any, ...(args as [any]));
  }

  public emitToRoom<K extends keyof ServerToClientEvents>(
    room: string,
    event: K,
    data: Parameters<ServerToClientEvents[K]>[0],
  ): boolean;
  public emitToRoom(room: string, event: string, ...args: any[]): boolean;
  public emitToRoom(room: string, event: string, ...args: any[]): boolean {
    const io = this.getIO();
    return io.to(room).emit(event as any, ...(args as [any]));
  }

  public broadcast<K extends keyof ServerToClientEvents>(
    event: K,
    data: Parameters<ServerToClientEvents[K]>[0],
  ): boolean;
  public broadcast(event: string, ...args: any[]): boolean;
  public broadcast(event: string, ...args: any[]): boolean {
    const io = this.getIO();
    return io.emit(event as any, ...(args as [any]));
  }

  public async isUserOnline(userId: string): Promise<boolean> {
    const count = await this.redisService.hasSockets(userId);
    return count > 0;
  }

  public async getUserSockets(userId: string): Promise<string[]> {
    return this.redisService.getUserSockets(userId);
  }
}

export const realtimeGateway = new RealtimeGateway();
export const getIO = (): TypedServer => realtimeGateway.getIO();
