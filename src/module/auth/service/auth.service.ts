import { User } from "../../../model/user.model";
import { env } from "../../../config/env.service";
import { compare } from "bcrypt";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  UserAlreadyExistsError,
} from "../../../common/response/error.response";
import { IUser } from "../../../common/interface/user.interface";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { IAuthResponse } from "../../../common/interface/auth.interface";
import bcrypt from "bcrypt";
import sendEmail from "../../../common/utils/sendEmail";
import crypto from "crypto";

class AuthService {
  async login(email: string, password: string): Promise<IAuthResponse> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid password");
    }

    const accessToken = jwt.sign({ id: user.id }, env.JWT_SECRET_LOGIN, {
      expiresIn: "1h",
      jwtid: uuidv4(),
    });

    const refreshToken = jwt.sign({ id: user.id }, env.JWT_SECRET_REFRESH, {
      expiresIn: "7d",
      jwtid: uuidv4(),
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async register(
    email: string,
    password: string,
    confirmPassword: string,
    name: string,
    gender: string,
    role: string,
    provider: string,
  ): Promise<IUser> {
    if (password !== confirmPassword) {
      throw new BadRequestError("Passwords do not match");
    }
    const user = await User.findOne({ email });
    if (user) {
      throw new UserAlreadyExistsError("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, Number(env.SALT));
    const createOtp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(createOtp, Number(env.SALT));
    const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Welcome to Social App!</h2>
    <p>Please use the following OTP to verify your account:</p>
    <h1 style="color: #4CAF50;">${createOtp}</h1>
    <p>This code is valid for 10 minutes.</p>
  </div>
`;
    await sendEmail(email, "Verify your email", html);
    const newUser = new User({
      email,
      otp: hashedOtp,
      password: hashedPassword,
      name,
      gender,
      role,
      provider,
    });
    await newUser.save();
    return newUser;
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const isMatch = await compare(otp, user.otp||"");
    if (!isMatch) {
      throw new UnauthorizedError("Invalid OTP");
    }
    user.isVerified = true;
    delete user.otp;
    await user.save();
    return true;
  }

  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const createOtp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = await bcrypt.hash(createOtp, Number(env.SALT));
    const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Welcome to Social App!</h2>
    <p>Please use the following OTP to verify your account:</p>
    <h1 style="color: #4CAF50;">${createOtp}</h1>
    <p>This code is valid for 10 minutes.</p>
  </div>
`;
    await sendEmail(email, "Verify your email", html);
    user.otp = hashedOtp;
    await user.save();
  }
  }   

export default new AuthService();
