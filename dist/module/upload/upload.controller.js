"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_response_1 = require("../../common/response/success.response");
const error_response_1 = require("../../common/response/error.response");
const upload_service_1 = require("./service/upload.service");
const upload_middleware_1 = require("./upload.middleware");
const uploadRouter = (0, express_1.default)();
/**
 * POST /upload/profile-picture (aliases: /profile-pic, /avatar)
 * Uploads user profile/avatar picture and links it directly to the user in the database.
 * Fully server-sided single endpoint call.
 */
uploadRouter.post(["/profile-picture", "/profile-pic", "/avatar"], (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.profileUploadMiddleware, async (req, res, next) => {
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No profile image file uploaded");
        }
        const type = (req.body.type === "cover" ? "cover" : "avatar");
        const result = await upload_service_1.uploadService.uploadAndLinkProfilePicture(req.user?.id, file, req, type);
        return (0, success_response_1.successResponse)(res, result, `${type === "cover" ? "Cover" : "Profile"} picture uploaded and linked successfully`, 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /upload/post-picture (aliases: /post-pic, /post-image)
 * Uploads a post picture with post-specific logic and links it directly to a post on the server-side.
 * If postId is provided, links to that post.
 * If title & content are provided, creates the post and links the image in one call.
 * If neither is provided, returns the uploaded post media URL.
 */
uploadRouter.post(["/post-picture", "/post-pic", "/post-image"], (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.postUploadMiddleware, async (req, res, next) => {
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No post image file uploaded");
        }
        const postId = req.body.postId || req.query.postId;
        const result = await upload_service_1.uploadService.uploadAndLinkPostPicture(req.user?.id, file, req, {
            postId,
            postData: req.body,
        });
        const status = result.post && !postId ? 201 : 200;
        return (0, success_response_1.successResponse)(res, result, result.post
            ? "Post picture uploaded and linked successfully"
            : "Post image uploaded successfully", status);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /upload/image
 * Legacy backward compatibility route
 */
uploadRouter.post("/image", (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.postUploadMiddleware, async (req, res, next) => {
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No image file uploaded");
        }
        const uploadResult = await upload_service_1.uploadService.uploadToStorage(file, "general", "img", req);
        return (0, success_response_1.successResponse)(res, uploadResult, "Image uploaded successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = uploadRouter;
