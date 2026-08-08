import Types from "mongoose";
import { IPost } from "./post.interface";
import { IUser } from "./user.interface";

export interface IComment {
  id: string;
  content: string;
  ownerId: Types.ObjectId | IUser;
  postId: Types.ObjectId | IPost;
  mentions?: Types.ObjectId[] | IUser[];
  imageUrl?: string[];
}
