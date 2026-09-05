import mongoose from "mongoose";
import { IFriend } from "../../common/interface/friend.interface";
import { FriendStatus } from "../../common/enum/friend.enum";

const friendSchema = new mongoose.Schema<IFriend>(
  {
    requester: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(FriendStatus),
      default: FriendStatus.PENDING,
    },
  },
  { timestamps: true },
);

export const FriendModel = mongoose.model("Friend", friendSchema);
