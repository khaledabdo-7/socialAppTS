import { IUser } from "./user.interface";

export interface IAuthResponse {
  user: IUser;
  accessToken: string;
  refreshToken: string;
}
