"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_model_1 = require("../../../database/model/comment.model");
const database_repositorie_1 = require("../../../database/repositories/database.repositorie");
class CommentService {
    commentRepository;
    constructor() {
        this.commentRepository = new database_repositorie_1.DatabaseRepository(comment_model_1.Comment);
    }
    async createComment(commentData) {
        const newComment = new comment_model_1.Comment(commentData);
        await newComment.save();
        return newComment;
    }
    async getCommentsByPostId(postId) {
        return await this.commentRepository.findOne({ filter: { postId } });
    }
    async getCommentById(commentId) {
        const comment = await this.commentRepository.findOne({
            filter: { commentId },
        });
        return comment;
    }
}
exports.CommentService = CommentService;
