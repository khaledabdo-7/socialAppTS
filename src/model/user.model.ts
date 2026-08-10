import { IUser } from "../common/interface/user.interface";
import mongoose from "mongoose";
import { UserRole, UserGender, ProviderType } from "../common/enum/user.enum";

const UserSchema = new mongoose.Schema<IUser>(
  {
    id: {
      type: String,
      required: false,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    confirmPassword: {
      type: String,
      required: false,
    },
    otp: {
      type: String,
    },
    role: {
      type: String,
      default: UserRole.USER,
      enum: [UserRole.ADMIN, UserRole.USER],
    },
    gender: {
      type: String,
      default: UserGender.MALE,
      enum: [UserGender.MALE, UserGender.FEMALE],
    },
    provider: {
      type: String,
      default: ProviderType.SYSTEM,
      enum: [ProviderType.GOOGLE, ProviderType.FACEBOOK, ProviderType.SYSTEM],
    },
    isDeactivated: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", UserSchema);
