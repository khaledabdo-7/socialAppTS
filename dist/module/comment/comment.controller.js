"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const success_response_1 = require("../../common/response/success.response");
const comment_service_1 = require("./service/comment.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
// import { ObjectId } from "mongoose";
const commentRouter = (0, express_1.default)();
const commentService = new comment_service_1.CommentService();
commentRouter.post("/create-comment", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const commentData = req.body;
        const newComment = await commentService.createComment(commentData);
        return (0, success_response_1.successResponse)(res, newComment, "Comment created successfully", 201);
    }
    catch (error) {
        next(error);
    }
});
commentRouter.get("/get-comments-by-post-id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const comments = await commentService.getCommentsByPostId(req.params.postId);
        return (0, success_response_1.successResponse)(res, comments, "Comments retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
commentRouter.get("/get-comment-by-id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const comment = await commentService.getCommentById(req.params.commentId);
        return (0, success_response_1.successResponse)(res, comment, "Comment retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = commentRouter;
