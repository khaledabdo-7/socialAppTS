"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.realtimeGateway = void 0;
const socket_io_1 = require("socket.io");
const error_response_1 = require("../../common/response/error.response");
const redis_service_1 = require("../../common/services/redis.service");
const realtime_middleware_1 = require("./realtime.middleware");
const realtimeChat_gateway_1 = require("../chat/realtime/realtimeChat.gateway");
class RealtimeGateway {
    io = null;
    redisService;
    constructor(customRedisService) {
        this.redisService = customRedisService || redis_service_1.redisService;
    }
    initializer(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || "*",
                methods: ["GET", "POST"],
                credentials: true,
            },
            pingTimeout: 60000,
            pingInterval: 25000,
            transports: ["websocket", "polling"],
        });
        this.io.use(realtime_middleware_1.socketAuthMiddleware);
        this.io.engine.on("connection_error", (err) => {
            console.error("[Socket.IO Engine] Connection error:", {
                code: err.code,
                message: err.message,
                context: err.context,
            });
        });
        this.io.on("connection", async (socket) => {
            const userId = socket.data.userId;
            console.log(`[Socket.IO] Client connected: socketId=${socket.id}, userId=${userId}`);
            socket.join(`user:${userId}`);
            try {
                await this.redisService.saveUserSocket(userId, socket.id);
                const activeSockets = await this.redisService.hasSockets(userId);
                if (activeSockets === 1) {
                    socket.broadcast.emit("userOnline", { userId });
                }
            }
            catch (redisErr) {
                console.error("[Socket.IO] Failed to track socket in Redis:", redisErr);
            }
            socket.emit("connected", {
                socketId: socket.id,
                userId,
                message: "Connected to realtime gateway successfully",
            });
            realtimeChat_gateway_1.realtimeChatGateway.register(socket, this.io);
            socket.on("error", (error) => {
                console.error(`[Socket.IO] Socket error (${socket.id}):`, error);
            });
            socket.on("disconnect", async (reason) => {
                console.log(`[Socket.IO] Client disconnected: socketId=${socket.id}, userId=${userId}, reason=${reason}`);
                try {
                    await this.redisService.removeUserSocket(userId, socket.id);
                    const remainingSockets = await this.redisService.hasSockets(userId);
                    if (remainingSockets === 0) {
                        socket.broadcast.emit("userOffline", { userId });
                    }
                }
                catch (redisErr) {
                    console.error("[Socket.IO] Failed to remove socket from Redis:", redisErr);
                }
            });
        });
        console.log("[Socket.IO] Realtime Gateway initialized successfully");
        return this.io;
    }
    getIO() {
        if (!this.io) {
            throw new error_response_1.InternalServerError("Socket.IO server has not been initialized yet. Call initializer() first.");
        }
        return this.io;
    }
    emitToUser(userId, event, ...args) {
        const io = this.getIO();
        return io.to(`user:${userId}`).emit(event, ...args);
    }
    emitToRoom(room, event, ...args) {
        const io = this.getIO();
        return io.to(room).emit(event, ...args);
    }
    broadcast(event, ...args) {
        const io = this.getIO();
        return io.emit(event, ...args);
    }
    async isUserOnline(userId) {
        const count = await this.redisService.hasSockets(userId);
        return count > 0;
    }
    async getUserSockets(userId) {
        return this.redisService.getUserSockets(userId);
    }
}
exports.realtimeGateway = new RealtimeGateway();
const getIO = () => exports.realtimeGateway.getIO();
exports.getIO = getIO;
