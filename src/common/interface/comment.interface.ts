import mongoose from "mongoose";
import { IPost } from "./post.interface";
import { IUser } from "./user.interface";
import { ReactType } from "../enum/reacts.enum";

export interface IComment {
  id: string;
  content: string;
  ownerId: mongoose.Types.ObjectId | IUser;
  postId: mongoose.Types.ObjectId | IPost;

  // postId: mongoose.Schema.Types.ObjectId

  // import { Types } from "mongoose";
  // ownerId: Types.ObjectId
  mentions?: mongoose.Types.ObjectId[] | IUser[];
  imageUrl?: string[];
  reactions?: ReactType;
  replies?: mongoose.Types.ObjectId[] | IComment[];
}
