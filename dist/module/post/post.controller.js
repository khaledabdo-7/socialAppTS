"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const success_response_1 = require("../../common/response/success.response");
const post_service_1 = require("./service/post.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const postRouter = (0, express_1.default)();
const postService = new post_service_1.PostService();
postRouter.post("/create-post", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const postData = req.body;
        console.log("Post data in controller:", postData); // Log the post data to verify its structure
        postData.ownerId = req.user?.id;
        console.log("Owner ID in controller:", postData.ownerId); // Log the owner ID to verify its structure
        const newPost = await postService.createPost(postData);
        return (0, success_response_1.successResponse)(res, newPost, "Post created successfully", 201);
    }
    catch (error) {
        next(error);
    }
});
postRouter.get("/get-posts", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const posts = await postService.getPosts(req.user?.id);
        return (0, success_response_1.successResponse)(res, posts, "Posts retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
postRouter.get("/get-post-by-id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const post = await postService.getPostById(req.params.postId);
        return (0, success_response_1.successResponse)(res, post, "Post retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = postRouter;
