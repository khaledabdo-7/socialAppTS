import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  read: boolean;
  roomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    roomId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const MessageModel = mongoose.model<IMessage>("Message", MessageSchema);
