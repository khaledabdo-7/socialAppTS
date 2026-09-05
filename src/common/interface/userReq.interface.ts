import { Request } from "express";
import { IUser } from "../interface/user.interface";

export interface UserReq extends Request {
  user: IUser;
}
