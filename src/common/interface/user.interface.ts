import { ProviderType, UserGender, UserRole } from "../enum/user.enum";

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
}
