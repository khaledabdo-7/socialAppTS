"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAccessToken = exports.generateRefreshToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const env_service_1 = require("../../config/env.service");
const generateRefreshToken = (user) => {
    const refreshToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_service_1.env.JWT_SECRET_REFRESH, {
        expiresIn: "7d",
        jwtid: (0, uuid_1.v4)(),
    });
    return refreshToken;
};
exports.generateRefreshToken = generateRefreshToken;
const generateAccessToken = (user) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, env_service_1.env.JWT_SECRET_LOGIN, {
        expiresIn: "1h",
        jwtid: (0, uuid_1.v4)(),
    });
    return accessToken;
};
exports.generateAccessToken = generateAccessToken;
