"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.realtimeChatGateway = void 0;
const chatEvents_1 = require("./chatEvents");
class RealtimeChatGateway {
    register(socket, io) {
        socket.on("sendMessage", async (data, callback) => {
            await chatEvents_1.chatEvents.handleSendMessage(socket, io, data, callback);
        });
        socket.on("typing", async (data) => {
            await chatEvents_1.chatEvents.handleTyping(socket, io, data);
        });
        socket.on("joinRoom", async (room, callback) => {
            await chatEvents_1.chatEvents.handleJoinRoom(socket, io, room, callback);
        });
        socket.on("leaveRoom", async (room, callback) => {
            await chatEvents_1.chatEvents.handleLeaveRoom(socket, io, room, callback);
        });
        chatEvents_1.chatEvents.sayHi(socket);
    }
}
exports.realtimeChatGateway = new RealtimeChatGateway();
