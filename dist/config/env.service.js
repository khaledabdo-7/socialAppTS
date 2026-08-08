"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = require("dotenv");
const node_path_1 = __importDefault(require("node:path"));
(0, dotenv_1.config)({ path: node_path_1.default.resolve(`./.env.${process.env.NODE_ENV}`) });
const PORT = Number(process.env.PORT);
const mongoURL = process.env.DB_URL;
const SALT = process.env.SALT;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_USER = process.env.EMAIL_USER;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_LOGIN = process.env.JWT_SECRET_LOGIN;
const JWT_SECRET_REFRESH = process.env.JWT_SECRET_REFRESH;
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER;
const CLIENT_ID = process.env.CLIENT_ID;
const REDIS_URL = process.env.REDIS_URL;
exports.env = {
    PORT,
    mongoURL,
    SALT,
    EMAIL_PASS,
    EMAIL_USER,
    JWT_SECRET,
    JWT_SECRET_LOGIN,
    JWT_SECRET_REFRESH,
    CLIENT_ID,
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_FOLDER,
    REDIS_URL,
};
