import { IUser } from "./user.interface";
import { Types } from "mongoose";
import { ReactType } from "../enum/reacts.enum";
import { Request } from "express";

export interface IPost {
  id: string;
  title: string;
  content: string;
  ownerId: Types.ObjectId | IUser;
  tags?: Types.ObjectId[] | IUser[];
  allowComments: boolean;
  imageUrl?: string[];
  reaction?: ReactType;
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}
