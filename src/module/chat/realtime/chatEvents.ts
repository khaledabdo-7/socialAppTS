import {
  TypedServer,
  TypedSocket,
  MessagePayload,
  TypingPayload,
  MessageResponse,
} from "../../realtime/realtime.interface";
import { BadRequestError } from "../../../common/response/error.response";

class ChatEvents {
  public async handleSendMessage(
    socket: TypedSocket,
    io: TypedServer,
    data: MessagePayload,
    callback?: (response: { success: boolean; error?: string; data?: any }) => void,
  ): Promise<void> {
    try {
      const senderId = socket.data.userId;

      if (!data || !data.receiverId || !data.message?.trim()) {
        throw new BadRequestError("receiverId and non-empty message are required");
      }

      const messageData: MessageResponse = {
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

      if (!data || !data.receiverId) {
        return;
      }

      io.to(`user:${data.receiverId}`).emit("userTyping", {
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
