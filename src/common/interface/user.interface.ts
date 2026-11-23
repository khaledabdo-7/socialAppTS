import { ProviderType, UserGender, UserRole } from "../enum/user.enum";
import { JwtPayload } from "jsonwebtoken";

export interface IUser {
  id?: string;
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  otp?: string;
  role?: UserRole;
  gender?: UserGender;
  provider?: ProviderType;
  isDeactivated?: boolean;
  isVerified: boolean;
  isPrivate?: boolean;
  avatar?: string;
  avatarUrl?: string;
  bio?: string;
  coverImage?: string;
}

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: UserRole;
  jwtid?: string;
}
