"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_model_1 = require("../../../database/model/comment.model");
class CommentService {
    async createComment(commentData) {
        const newComment = new comment_model_1.Comment(commentData);
        await newComment.save();
        return newComment;
    }
    async getCommentsByPostId(postId) {
        return await comment_model_1.Comment.find({ where: { postId } });
    }
    async getCommentById(commentId) {
        const comment = await comment_model_1.Comment.findById(commentId);
        return comment;
    }
}
exports.CommentService = CommentService;
