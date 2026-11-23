import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { env } from "../../config/env.service";

export const generateRefreshToken = (user: { _id?: any; id?: any; role: string }) => {
  const userId = (user._id || user.id || "").toString();
  const refreshToken = jwt.sign(
    { id: userId, _id: userId, role: user.role },
    env.JWT_SECRET_REFRESH,
    {
      expiresIn: "7d",
      jwtid: uuidv4(),
    },
  );
  return refreshToken;
};

export const generateAccessToken = (user: { _id?: any; id?: any; role: string }) => {
  const userId = (user._id || user.id || "").toString();
  const accessToken = jwt.sign(
    { id: userId, _id: userId, role: user.role },
    env.JWT_SECRET_LOGIN,
    {
      expiresIn: "7d",
      jwtid: uuidv4(),
    },
  );
  return accessToken;
};
