import { IUser } from "./user.interface";
import { Types } from "mongoose";

export interface IPost {
  id: string;
  title: string;
  content: string;
  ownerId: Types.ObjectId | IUser;
  tags?: Types.ObjectId[] | IUser[];
  allowComments: boolean;
  imageUrl?: string[];
}
