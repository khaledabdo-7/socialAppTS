import { IUser } from "./user.interface";
import mongoose from "mongoose";
import { ReactType } from "../enum/reacts.enum";
import { Request } from "express";

export interface IPost {
  id: string;
  title: string;
  content: string;
  comments?: mongoose.Types.ObjectId[];
  ownerId: mongoose.Types.ObjectId;
  tags?: string[];
  allowComments: boolean;
  imageUrl?: string;
  reaction?: { userId: mongoose.Types.ObjectId; type: ReactType }[];
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role?: string;
    email?: string;
  };
}




