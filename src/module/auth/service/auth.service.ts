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
    const createOtp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(createOtp.toString(), Number(env.SALT));
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
}
export default new AuthService();
