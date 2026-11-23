"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const success_response_1 = require("../../common/response/success.response");
const post_service_1 = require("./service/post.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const upload_service_1 = require("../upload/service/upload.service");
const upload_middleware_1 = require("../upload/upload.middleware");
const error_response_1 = require("../../common/response/error.response");
const postRouter = (0, express_1.default)();
/**
 * POST /post/create-post
 * Create a new post. Supports multipart/form-data with attached image file,
 * uploading and linking the picture to the post server-side in ONE endpoint call.
 */
postRouter.post("/create-post", (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.postUploadMiddleware, async (req, res, next) => {
    try {
        const postData = { ...req.body };
        postData.ownerId = req.user?.id;
        // Handle attached picture if present
        const file = (0, upload_middleware_1.extractFile)(req);
        if (file) {
            const uploadResult = await upload_service_1.uploadService.uploadToStorage(file, "posts", "post", req);
            postData.imageUrl = uploadResult.url;
        }
        // Format tags if sent as string in multipart
        if (typeof postData.tags === "string") {
            try {
                postData.tags = JSON.parse(postData.tags);
            }
            catch {
                postData.tags = postData.tags
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean);
            }
        }
        // Format allowComments if sent as string in multipart
        if (typeof postData.allowComments === "string") {
            postData.allowComments = postData.allowComments !== "false";
        }
        const newPost = await post_service_1.postService.createPost(postData);
        return (0, success_response_1.successResponse)(res, newPost, "Post created successfully", 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST or PATCH /post/:id/image
 * Upload picture and link directly to an existing post server-side in ONE endpoint call
 */
postRouter.use("/:id/image", (0, auth_middleware_1.authMiddleware)(), upload_middleware_1.postUploadMiddleware, async (req, res, next) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
        return next();
    }
    try {
        const file = (0, upload_middleware_1.extractFile)(req);
        if (!file) {
            throw new error_response_1.BadRequestError("No post image file uploaded");
        }
        const postId = req.params.id;
        const result = await upload_service_1.uploadService.uploadAndLinkPostPicture(req.user?.id, file, req, { postId });
        return (0, success_response_1.successResponse)(res, result, "Post picture uploaded and linked successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /post/feed
 * Smart social feed (user posts + friends posts)
 */
postRouter.get("/feed", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const feed = await post_service_1.postService.getFeed(req.user?.id, page, limit);
        return (0, success_response_1.successResponse)(res, feed, "Feed retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /post/get-posts (legacy route supporting feed or user posts)
 */
postRouter.get("/get-posts", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        if (req.query.ownerId) {
            const posts = await post_service_1.postService.getUserPosts(req.query.ownerId);
            return (0, success_response_1.successResponse)(res, posts, "User posts retrieved successfully", 200);
        }
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const feed = await post_service_1.postService.getFeed(req.user?.id, page, limit);
        return (0, success_response_1.successResponse)(res, feed.posts, "Posts retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /post/user/:userId
 * Fetch posts of a specific user
 */
postRouter.get("/user/:userId", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const posts = await post_service_1.postService.getUserPosts(userId);
        return (0, success_response_1.successResponse)(res, posts, "User posts retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /post/get-post-by-id and /post/get-post-by-id/:id
 * Legacy support for old client paths
 */
postRouter.get(["/get-post-by-id", "/get-post-by-id/:id"], (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const postId = (req.params.id || req.query.postId);
        const post = await post_service_1.postService.getPostById(postId);
        return (0, success_response_1.successResponse)(res, post, "Post retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /post/:id/react and /post/react/:id
 * React to post (Like, Love, Haha, Wow, Sad, Angry)
 */
postRouter.post(["/:id/react", "/react/:id"], (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = (req.params.id || req.params.postId);
        const type = (req.body.type || req.body.reaction);
        const result = await post_service_1.postService.toggleReaction(id, req.user?.id, type);
        return (0, success_response_1.successResponse)(res, result, result.message, 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /post/:id
 * Edit a post
 */
postRouter.patch("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        const updatedPost = await post_service_1.postService.updatePost(id, req.user?.id, req.body);
        return (0, success_response_1.successResponse)(res, updatedPost, "Post updated successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /post/:id
 * Delete a post
 */
postRouter.delete("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        await post_service_1.postService.deletePost(id, req.user?.id, req.user?.role);
        return (0, success_response_1.successResponse)(res, null, "Post deleted successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /post/:id
 * RESTful get post by id
 */
postRouter.get("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        const post = await post_service_1.postService.getPostById(id);
        return (0, success_response_1.successResponse)(res, post, "Post retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = postRouter;
