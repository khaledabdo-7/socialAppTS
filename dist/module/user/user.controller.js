"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_service_1 = require("./service/user.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_response_1 = require("../../common/response/success.response");
const error_response_1 = require("../../common/response/error.response");
const upload_service_1 = require("../upload/service/upload.service");
const upload_middleware_1 = require("../upload/upload.middleware");
const userRouter = (0, express_1.default)();
/**
 * POST or PATCH /user/profile-picture (alias /user/avatar)
 * Uploads avatar image and links directly to user profile server-sided in one call
 */
userRouter.use(["/profile-picture", "/avatar"], (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.profileUploadMiddleware, async (req, res, next) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
        return next();
    }
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No profile image file uploaded");
        }
        const result = await upload_service_1.uploadService.uploadAndLinkProfilePicture(req.user?.id, file, req, "avatar");
        return (0, success_response_1.successResponse)(res, result, "Profile picture uploaded and linked successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST or PATCH /user/cover-picture
 * Uploads cover photo and links directly to user profile server-sided in one call
 */
userRouter.use("/cover-picture", (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.profileUploadMiddleware, async (req, res, next) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
        return next();
    }
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No cover image file uploaded");
        }
        const result = await upload_service_1.uploadService.uploadAndLinkProfilePicture(req.user?.id, file, req, "cover");
        return (0, success_response_1.successResponse)(res, result, "Cover picture uploaded and linked successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /user/me
 * Get current user profile
 */
userRouter.get("/me", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const user = await user_service_1.userService.getUserById(req.user?.id);
        return (0, success_response_1.successResponse)(res, user, "User fetched successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /user/search?q=...
 * Search users by name or email
 */
userRouter.get("/search", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const query = (req.query.q || req.query.query || "");
        const limit = Number(req.query.limit) || 20;
        const results = await user_service_1.userService.searchUsers(query, req.user?.id, limit);
        return (0, success_response_1.successResponse)(res, results, "Search results retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /user/suggestions
 * Discover new users to connect with
 */
userRouter.get("/suggestions", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const limit = Number(req.query.limit) || 8;
        const suggestions = await user_service_1.userService.getSuggestions(req.user?.id, limit);
        return (0, success_response_1.successResponse)(res, suggestions, "Friend suggestions retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /user/update-profile
 * Update profile details (bio, avatar, coverImage, name, gender)
 */
userRouter.patch("/update-profile", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const updated = await user_service_1.userService.updateProfile(req.user?.id, req.body);
        return (0, success_response_1.successResponse)(res, updated, "Profile updated successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /user/:id
 * Get profile of specific user
 */
userRouter.get("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        const user = await user_service_1.userService.getUserById(id, req.user?.id);
        return (0, success_response_1.successResponse)(res, user, "User profile fetched successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = userRouter;
