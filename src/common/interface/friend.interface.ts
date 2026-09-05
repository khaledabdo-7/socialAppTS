import mongoose, { Document } from "mongoose";
import { FriendStatus } from "../enum/friend.enum";

export interface IFriend extends Document {
  requester: mongoose.Types.ObjectId;
  recipient: mongoose.Types.ObjectId;
  status: FriendStatus;
  createdAt: Date;
  updatedAt: Date;
}
