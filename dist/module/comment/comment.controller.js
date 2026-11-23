"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const success_response_1 = require("../../common/response/success.response");
const comment_service_1 = require("./service/comment.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const commentRouter = (0, express_1.default)();
/**
 * POST /comment/create-comment
 * Create comment with verified owner
 */
commentRouter.post("/create-comment", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const commentData = req.body;
        const ownerId = req.user?.id;
        const newComment = await comment_service_1.commentService.createComment(commentData, ownerId);
        return (0, success_response_1.successResponse)(res, newComment, "Comment created successfully", 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /comment/post/:postId
 * RESTful get comments by post ID
 */
commentRouter.get("/post/:postId", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const postId = req.params.postId;
        const comments = await comment_service_1.commentService.getCommentsByPostId(postId);
        return (0, success_response_1.successResponse)(res, comments, "Comments retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /comment/get-comments-by-post-id and /comment/get-comments-by-post-id/:postId
 * Backward compatibility alias
 */
commentRouter.get(["/get-comments-by-post-id", "/get-comments-by-post-id/:postId"], (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const postId = (req.params.postId || req.query.postId);
        const comments = await comment_service_1.commentService.getCommentsByPostId(postId);
        return (0, success_response_1.successResponse)(res, comments, "Comments retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /comment/get-comment-by-id and /comment/get-comment-by-id/:commentId
 * Backward compatibility alias
 */
commentRouter.get(["/get-comment-by-id", "/get-comment-by-id/:commentId"], (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const commentId = (req.params.commentId || req.query.commentId);
        const comment = await comment_service_1.commentService.getCommentById(commentId);
        return (0, success_response_1.successResponse)(res, comment, "Comment retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /comment/:id
 * Delete comment
 */
commentRouter.delete("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const commentId = req.params.id;
        await comment_service_1.commentService.deleteComment(commentId, req.user?.id, req.user?.role);
        return (0, success_response_1.successResponse)(res, null, "Comment deleted successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /comment/:id
 * RESTful get comment by ID
 */
commentRouter.get("/:id", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const commentId = req.params.id;
        const comment = await comment_service_1.commentService.getCommentById(commentId);
        return (0, success_response_1.successResponse)(res, comment, "Comment retrieved successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = commentRouter;
