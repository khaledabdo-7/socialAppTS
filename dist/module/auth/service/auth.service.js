"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = require("../../../model/user.model");
const env_service_1 = require("../../../config/env.service");
const bcrypt_1 = require("bcrypt");
const error_response_1 = require("../../../common/response/error.response");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const bcrypt_2 = __importDefault(require("bcrypt"));
const sendEmail_1 = __importDefault(require("../../../common/utils/sendEmail"));
class AuthService {
    async login(email, password) {
        const user = await user_model_1.User.findOne({ email });
        if (!user) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const isMatch = await (0, bcrypt_1.compare)(password, user.password);
        if (!isMatch) {
            throw new error_response_1.UnauthorizedError("Invalid password");
        }
        const accessToken = jsonwebtoken_1.default.sign({ id: user.id }, env_service_1.env.JWT_SECRET_LOGIN, {
            expiresIn: "1h",
            jwtid: (0, uuid_1.v4)(),
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, env_service_1.env.JWT_SECRET_REFRESH, {
            expiresIn: "7d",
            jwtid: (0, uuid_1.v4)(),
        });
        return {
            user,
            accessToken,
            refreshToken,
        };
    }
    async register(email, password, confirmPassword, name, gender, role, provider) {
        if (password !== confirmPassword) {
            throw new error_response_1.BadRequestError("Passwords do not match");
        }
        const user = await user_model_1.User.findOne({ email });
        if (user) {
            throw new error_response_1.UserAlreadyExistsError("User already exists");
        }
        const hashedPassword = await bcrypt_2.default.hash(password, Number(env_service_1.env.SALT));
        const createOtp = Math.floor(100000 + Math.random() * 900000);
        const hashedOtp = await bcrypt_2.default.hash(createOtp.toString(), Number(env_service_1.env.SALT));
        const html = `
  <div style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Welcome to Social App!</h2>
    <p>Please use the following OTP to verify your account:</p>
    <h1 style="color: #4CAF50;">${createOtp}</h1>
    <p>This code is valid for 10 minutes.</p>
  </div>
`;
        await (0, sendEmail_1.default)(email, "Verify your email", html);
        const newUser = new user_model_1.User({
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
exports.default = new AuthService();
