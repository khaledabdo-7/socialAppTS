"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvents = void 0;
const error_response_1 = require("../../../common/response/error.response");
class ChatEvents {
    async handleSendMessage(socket, io, data, callback) {
        try {
            const senderId = socket.data.userId;
            if (!data || !data.receiverId || !data.message?.trim()) {
                throw new error_response_1.BadRequestError("receiverId and non-empty message are required");
            }
            const messageData = {
                senderId,
                message: data.message.trim(),
                timestamp: new Date(),
                roomId: data.roomId,
            };
            io.to(`user:${data.receiverId}`).emit("receiveMessage", messageData);
            if (data.roomId) {
                socket.to(data.roomId).emit("receiveMessage", messageData);
            }
            if (typeof callback === "function") {
                callback({ success: true, data: messageData });
            }
        }
        catch (error) {
            console.error("[ChatEvents] Error in handleSendMessage:", error);
            if (typeof callback === "function") {
                callback({
                    success: false,
                    error: error.message || "Failed to send message",
                });
            }
            else {
                socket.emit("error", {
                    message: error.message || "Failed to send message",
                    statusCode: error.statusCode || 500,
                });
            }
        }
    }
    async handleTyping(socket, io, data) {
        try {
            const senderId = socket.data.userId;
            if (!data || !data.receiverId) {
                return;
            }
            io.to(`user:${data.receiverId}`).emit("userTyping", {
                userId: senderId,
                isTyping: Boolean(data.isTyping),
            });
        }
        catch (error) {
            console.error("[ChatEvents] Error in handleTyping:", error);
        }
    }
    async handleJoinRoom(socket, _io, room, callback) {
        try {
            if (!room || typeof room !== "string") {
                throw new error_response_1.BadRequestError("Valid room identifier is required");
            }
            await socket.join(room);
            console.log(`[ChatEvents] Socket ${socket.id} (User: ${socket.data.userId}) joined room: ${room}`);
            if (typeof callback === "function") {
                callback({ success: true, room });
            }
        }
        catch (error) {
            console.error("[ChatEvents] Error in handleJoinRoom:", error);
            if (typeof callback === "function") {
                callback({
                    success: false,
                    room: room || "",
                    error: error.message || "Failed to join room",
                });
            }
            else {
                socket.emit("error", {
                    message: error.message || "Failed to join room",
                    statusCode: error.statusCode || 500,
                });
            }
        }
    }
    async handleLeaveRoom(socket, _io, room, callback) {
        try {
            if (!room || typeof room !== "string") {
                throw new error_response_1.BadRequestError("Valid room identifier is required");
            }
            await socket.leave(room);
            console.log(`[ChatEvents] Socket ${socket.id} left room: ${room}`);
            if (typeof callback === "function") {
                callback({ success: true, room });
            }
        }
        catch (error) {
            console.error("[ChatEvents] Error in handleLeaveRoom:", error);
            if (typeof callback === "function") {
                callback({
                    success: false,
                    room: room || "",
                    error: error.message || "Failed to leave room",
                });
            }
            else {
                socket.emit("error", {
                    message: error.message || "Failed to leave room",
                    statusCode: error.statusCode || 500,
                });
            }
        }
    }
    sayHi(socket) {
        socket.emit("receiveMessage", {
            senderId: "system",
            message: "Connected to chat server",
            timestamp: new Date(),
        });
    }
}
exports.chatEvents = new ChatEvents();
