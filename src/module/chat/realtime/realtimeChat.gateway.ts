import { TypedServer, TypedSocket } from "../../realtime/realtime.interface";
import { chatEvents } from "./chatEvents";

class RealtimeChatGateway {
  public register(socket: TypedSocket, io: TypedServer): void {
    socket.on("sendMessage", async (data, callback) => {
      await chatEvents.handleSendMessage(socket, io, data, callback);
    });

    socket.on("typing", async (data) => {
      await chatEvents.handleTyping(socket, io, data);
    });

    socket.on("joinRoom", async (room, callback) => {
      await chatEvents.handleJoinRoom(socket, io, room, callback);
    });

    socket.on("leaveRoom", async (room, callback) => {
      await chatEvents.handleLeaveRoom(socket, io, room, callback);
    });

    chatEvents.sayHi(socket);
  }
}

export const realtimeChatGateway = new RealtimeChatGateway();
