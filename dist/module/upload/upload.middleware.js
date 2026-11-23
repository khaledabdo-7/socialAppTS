"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractFile = exports.postUploadMiddleware = exports.profileUploadMiddleware = exports.postUpload = exports.profileUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const error_response_1 = require("../../common/response/error.response");
const storage = multer_1.default.memoryStorage();
const imageFileFilter = (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
        cb(null, true);
    }
    else {
        cb(new error_response_1.BadRequestError("Only image files are allowed"));
    }
};
/**
 * Multer configuration specialized for profile avatars and cover images:
 * - 5MB maximum file size
 * - Image MIME types only
 */
exports.profileUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: imageFileFilter,
});
/**
 * Multer configuration specialized for post media and photos:
 * - 15MB maximum file size
 * - Image MIME types only
 */
exports.postUpload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 15 * 1024 * 1024, // 15MB max
    },
    fileFilter: imageFileFilter,
});
exports.profileUploadMiddleware = exports.profileUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "avatar", maxCount: 1 },
    { name: "cover", maxCount: 1 },
    { name: "file", maxCount: 1 },
]);
exports.postUploadMiddleware = exports.postUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 },
    { name: "postImage", maxCount: 1 },
]);
const extractFile = (req) => {
    if (req.file)
        return req.file;
    if (req.files) {
        const files = req.files;
        return (files["image"]?.[0] ||
            files["avatar"]?.[0] ||
            files["cover"]?.[0] ||
            files["file"]?.[0] ||
            files["postImage"]?.[0]);
    }
    return undefined;
};
exports.extractFile = extractFile;
