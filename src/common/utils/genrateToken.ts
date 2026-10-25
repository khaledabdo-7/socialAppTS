import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env.service";

export const generateRefreshToken = (user: { _id: string; role: string }) => {
  const refreshToken = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET_REFRESH,
    {
      expiresIn: "7d",
      jwtid: uuidv4(),
    },
  );
  return refreshToken;
};

export const generateAccessToken = (user: { _id: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    env.JWT_SECRET_LOGIN,
    {
      expiresIn: "1h",
      jwtid: uuidv4(),
    },
  );
  return accessToken;
};
