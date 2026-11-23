import {
  TypedServer,
  TypedSocket,
  MessagePayload,
  TypingPayload,
  MessageResponse,
} from "../../realtime/realtime.interface";
import { BadRequestError } from "../../../common/response/error.response";
import { MessageModel } from "../../../database/model/message.model";
import { Types } from "mongoose";

class ChatEvents {
  public async handleSendMessage(
    socket: TypedSocket,
    io: TypedServer,
    data: MessagePayload,
    callback?: (response: { success: boolean; error?: string; data?: any }) => void,
  ): Promise<void> {
    try {
      const senderId = socket.data.userId;
      const targetReceiverId = (data?.receiverId || (data as any)?.recipientId || "").toString();

      if (!data || !targetReceiverId || !data.message?.trim()) {
        throw new BadRequestError("receiverId and non-empty message are required");
      }

      // 1. Save message permanently to MongoDB
      const newMsg = new MessageModel({
        senderId: new Types.ObjectId(senderId),
        receiverId: new Types.ObjectId(targetReceiverId),
        message: data.message.trim(),
        roomId: data.roomId,
      });
      const savedMessage = await newMsg.save();

      const messageData: MessageResponse = {
        _id: (savedMessage._id as any)?.toString(),
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
    } catch (error: any) {
      console.error("[ChatEvents] Error in handleSendMessage:", error);
      if (typeof callback === "function") {
        callback({
          success: false,
          error: error.message || "Failed to send message",
        });
      } else {
        socket.emit("error", {
          message: error.message || "Failed to send message",
          statusCode: error.statusCode || 500,
        });
      }
    }
  }

  public async handleTyping(
    socket: TypedSocket,
    io: TypedServer,
    data: TypingPayload,
  ): Promise<void> {
    try {
      const senderId = socket.data.userId;
      const targetReceiverId = (data?.receiverId || (data as any)?.recipientId || "").toString();

      if (!data || !targetReceiverId) {
        return;
      }

      io.to(`user:${targetReceiverId}`).to(targetReceiverId).emit("userTyping", {
        userId: senderId,
        isTyping: Boolean(data.isTyping),
      });
    } catch (error: any) {
      console.error("[ChatEvents] Error in handleTyping:", error);
    }
  }

  public async handleJoinRoom(
    socket: TypedSocket,
    _io: TypedServer,
    room: string,
    callback?: (response: { success: boolean; room: string; error?: string }) => void,
  ): Promise<void> {
    try {
      if (!room || typeof room !== "string") {
        throw new BadRequestError("Valid room identifier is required");
      }

      await socket.join(room);
      console.log(`[ChatEvents] Socket ${socket.id} (User: ${socket.data.userId}) joined room: ${room}`);

      if (typeof callback === "function") {
        callback({ success: true, room });
      }
    } catch (error: any) {
      console.error("[ChatEvents] Error in handleJoinRoom:", error);
      if (typeof callback === "function") {
        callback({
          success: false,
          room: room || "",
          error: error.message || "Failed to join room",
        });
      } else {
        socket.emit("error", {
          message: error.message || "Failed to join room",
          statusCode: error.statusCode || 500,
        });
      }
    }
  }

  public async handleLeaveRoom(
    socket: TypedSocket,
    _io: TypedServer,
    room: string,
    callback?: (response: { success: boolean; room: string; error?: string }) => void,
  ): Promise<void> {
    try {
      if (!room || typeof room !== "string") {
        throw new BadRequestError("Valid room identifier is required");
      }

      await socket.leave(room);
      console.log(`[ChatEvents] Socket ${socket.id} left room: ${room}`);

      if (typeof callback === "function") {
        callback({ success: true, room });
      }
    } catch (error: any) {
      console.error("[ChatEvents] Error in handleLeaveRoom:", error);
      if (typeof callback === "function") {
        callback({
          success: false,
          room: room || "",
          error: error.message || "Failed to leave room",
        });
      } else {
        socket.emit("error", {
          message: error.message || "Failed to leave room",
          statusCode: error.statusCode || 500,
        });
      }
    }
  }

  public sayHi(socket: TypedSocket): void {
    socket.emit("receiveMessage", {
      senderId: "system",
      message: "Connected to chat server",
      timestamp: new Date(),
    });
  }
}

export const chatEvents = new ChatEvents();
