import { IPost } from "../../common/interface/post.interface";
import mongoose from "mongoose";
import { ReactType } from "../../common/enum/reacts.enum";

const PostSchema = new mongoose.Schema<IPost>(
  {
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
    comments: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Comment",
    },
    imageUrl: {
      type: String,
    },
    reaction: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        type: {
          type: String,
          enum: Object.values(ReactType),
        },
      },
    ],
  },
  { timestamps: true },
);

export const Post = mongoose.model<IPost>("Post", PostSchema);
