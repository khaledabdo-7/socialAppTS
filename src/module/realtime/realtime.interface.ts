import { Socket, Server } from "socket.io";
import { IUser } from "../../common/interface/user.interface";
import { UserRole } from "../../common/enum/user.enum";

export interface SocketData {
  user: IUser;
  userId: string;
  role?: UserRole | undefined;
}

export interface MessagePayload {
  receiverId: string;
  message: string;
  roomId?: string | undefined;
}

export interface MessageResponse {
  senderId: string;
  message: string;
  timestamp: Date | string;
  roomId?: string | undefined;
  [key: string]: any;
}

export interface TypingPayload {
  receiverId: string;
  isTyping: boolean;
}

export interface TypingResponse {
  userId: string;
  isTyping: boolean;
}

export interface NotificationPayload {
  type: string;
  title: string;
  body: string;
  [key: string]: any;
}

export interface SocketErrorPayload {
  message: string;
  statusCode?: number | undefined;
  cause?: any;
}

export interface ServerToClientEvents {
  receiveMessage: (data: MessageResponse) => void;
  userOnline: (data: { userId: string }) => void;
  userOffline: (data: { userId: string }) => void;
  userTyping: (data: TypingResponse) => void;
  notification: (data: NotificationPayload) => void;
  error: (error: SocketErrorPayload) => void;
  connected: (data: {
    socketId: string;
    userId: string;
    message: string;
  }) => void;
}

export interface ClientToServerEvents {
  sendMessage: (
    data: MessagePayload,
    callback?: (response: { success: boolean; error?: string; data?: any }) => void,
  ) => void;
  typing: (data: TypingPayload) => void;
  joinRoom: (
    room: string,
    callback?: (response: { success: boolean; room: string; error?: string }) => void,
  ) => void;
  leaveRoom: (
    room: string,
    callback?: (response: { success: boolean; room: string; error?: string }) => void,
  ) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type TypedServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

