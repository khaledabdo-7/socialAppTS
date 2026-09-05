import { IComment } from "../../common/interface/comment.interface";
import mongoose from "mongoose";
import { ReactType } from "../../common/enum/reacts.enum";
import { v4 as uuidv4 } from "uuid";

const CommentSchema = new mongoose.Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
    },
    ownerId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Post",
    },
    mentions: {
      type: [mongoose.Types.ObjectId],
      ref: "User",
    },
    imageUrl: {
      type: [String],
    },
    reactions: {
      type: String,
      enum: Object.values(ReactType),
    },
    replies: {
      type: [mongoose.Types.ObjectId],
      ref: "Comment",
    },
  },
  { timestamps: true },
);

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
