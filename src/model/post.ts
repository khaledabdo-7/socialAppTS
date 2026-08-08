import { IPost } from "../common/interface/post.interface";
import mongoose from "mongoose";

const PostSchema = new mongoose.Schema<IPost>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
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
    tags: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
    },
    allowComments: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
