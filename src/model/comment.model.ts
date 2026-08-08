import { IComment } from "../common/interface/comment.interface";
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema<IComment>({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  content: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Post",
  },
  mentions: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "User",
  },
  imageUrl: {
    type: [String],
  },
},{timestamps: true});

export const Comment = mongoose.model<IComment>("Comment", CommentSchema);
