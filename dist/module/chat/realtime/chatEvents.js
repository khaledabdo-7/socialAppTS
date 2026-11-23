"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatEvents = void 0;
const error_response_1 = require("../../../common/response/error.response");
const message_model_1 = require("../../../database/model/message.model");
const mongoose_1 = require("mongoose");
class ChatEvents {
    async handleSendMessage(socket, io, data, callback) {
        try {
            const senderId = socket.data.userId;
            const targetReceiverId = (data?.receiverId || data?.recipientId || "").toString();
            if (!data || !targetReceiverId || !data.message?.trim()) {
                throw new error_response_1.BadRequestError("receiverId and non-empty message are required");
            }
            // 1. Save message permanently to MongoDB
            const newMsg = new message_model_1.MessageModel({
                senderId: new mongoose_1.Types.ObjectId(senderId),
                receiverId: new mongoose_1.Types.ObjectId(targetReceiverId),
                message: data.message.trim(),
                roomId: data.roomId,
            });
            const savedMessage = await newMsg.save();
            const messageData = {
                _id: savedMessage._id?.toString(),
                senderId,
                receiverId: targetReceiverId,
                recipientId: targetReceiverId,
                message: savedMessage.message,
                timestamp: savedMessage.createdAt,
                roomId: data.roomId,
            };
            // 2. Deliver real-time message to receiver
            io.to(`user:${targetReceiverId}`).to(targetReceiverId).emit("receiveMessage", messageData);
            // If in a room, deliver to room members
            if (data.roomId) {
                socket.to(data.roomId).emit("receiveMessage", messageData);
            }
            // 3. Acknowledge sender with success & message data
            if (typeof callback === "function") {
                callback({ success: true, data: savedMessage });
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
            const targetReceiverId = (data?.receiverId || data?.recipientId || "").toString();
            if (!data || !targetReceiverId) {
                return;
            }
            io.to(`user:${targetReceiverId}`).to(targetReceiverId).emit("userTyping", {
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
