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
import { redisClient } from "../../../database/redis.connection";

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

    await redisClient.set(`otp:${email}`, hashedOtp, { EX: 600 });

    await sendEmail(email, "Verify your email", html);
    const newUser = new User({
      email,
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

    const storedHashedOtp = await redisClient.get(`otp:${email}`);
    if (!storedHashedOtp) {
      throw new NotFoundError("OTP not found");
    }
    const isMatch = await compare(otp, storedHashedOtp);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid OTP");
    }

    await redisClient.del(`otp:${email}`);

    user.isVerified = true;
    await user.save();
    return true;
  }

  async resendOtp(email: string): Promise<void> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isVerified) {
      throw new BadRequestError("User already verified");
    }
    const coolDown = await redisClient.get(`otp_coolDown:${email}`);
    if (coolDown) {
      throw new BadRequestError("Please wait before requesting a new OTP");
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
    await redisClient.set(`otp:${email}`, hashedOtp, { EX: 600 });
    await redisClient.set(`otp_coolDown:${email}`, Date.now(), {
      EX: 60,
    });
  }

async refreshToken(refreshToken: string): Promise<jwt.JwtPayload | string > {
  try
{
  
  const decodedToken  = jwt.verify(refreshToken, env.JWT_SECRET_REFRESH) as jwt.JwtPayload;


const accessToken = jwt.sign({ id: decodedToken.id }, env.JWT_SECRET_LOGIN, {
      expiresIn: "1h",
      jwtid: uuidv4(),
    });
    return accessToken;


}catch(error){

  throw new UnauthorizedError("Invalid refresh token");
}


}

async logout(accessToken: string , refreshToken: string): Promise<void> {

const getPayLoad = ( token: string, secret: string) => {
try{
  const decodedToken  = jwt.verify(token, secret) as jwt.JwtPayload;
  return decodedToken;
}catch(error: any){
 if(error.name === "TokenExpiredError"){
return jwt.verify(token , secret,  { ignoreExpiration: true }) as jwt.JwtPayload;
 }
 throw new UnauthorizedError("Invalid access token");
}
}

const decodedAccessToken= getPayLoad(accessToken, env.JWT_SECRET_LOGIN);
const decodedRefreshToken = getPayLoad(refreshToken, env.JWT_SECRET_REFRESH);

const nowInSeconds = Math.floor(Date.now() / 1000);
const accessTokenExpiresIn = (decodedAccessToken.exp??0) - nowInSeconds;
const refreshTokenExpiresIn = (decodedRefreshToken.exp??0) - nowInSeconds;

if (accessTokenExpiresIn > 0&& decodedAccessToken.jwtid) {
    await redisClient.set(`accessToken:${decodedAccessToken.jwtid}`, accessToken, {
      EX: accessTokenExpiresIn,
    });

}

if (refreshTokenExpiresIn > 0 && decodedRefreshToken.jwtid) {
    await redisClient.set(`refreshToken:${decodedRefreshToken.jwtid}`, refreshToken, {
      EX: refreshTokenExpiresIn,
    });

  }
}


async forgetPassword(email: string): Promise<void> {
const user = await User.findOne({ email });
if (!user) {
  throw new NotFoundError("User not found");
}
  const otp= crypto.randomInt(100000, 999999).toString();
  const hashedOtp = await bcrypt.hash(otp, Number(env.SALT));
  const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Reset Your Password</h2>
    <p>Please use the following OTP to reset your password:</p>
    <h1 style="color: #4CAF50;">${otp}</h1>
    <p>This code is valid for 10 minutes.</p>
  </div>
`;

sendEmail(email, "Reset your password", html);

await redisClient.set(`forgetPasswordOtp:${email}`, hashedOtp, { EX: 600 });

}


async resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
const user = await User.findOne({ email });
if (!user) {
  throw new NotFoundError("User not found");
}
  const storedHashedOtp = await redisClient.get(`forgetPasswordOtp:${email}`);
  if (!storedHashedOtp) {
    throw new NotFoundError("OTP not found");
  }
  const isMatch = await compare(otp, storedHashedOtp);
  if (!isMatch) {
    throw new UnauthorizedError("Invalid OTP");
  }
  await redisClient.del(`forgetPasswordOtp:${email}`);
  user.password = await bcrypt.hash(newPassword, Number(env.SALT));
  await user.save();
}

async changePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
const user = await User.findOne({ email });
if (!user) {
  throw new NotFoundError("User not found");
}

const isMatch = await compare(oldPassword, user.password);
if (!isMatch) {
  throw new UnauthorizedError("Invalid password");
}

  user.password = await bcrypt.hash(newPassword, Number(env.SALT));
  await user.save();
}
}
export default new AuthService();
