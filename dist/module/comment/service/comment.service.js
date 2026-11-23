"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = exports.CommentService = void 0;
const comment_model_1 = require("../../../database/model/comment.model");
const post_1 = require("../../../database/model/post");
const error_response_1 = require("../../../common/response/error.response");
const notification_service_1 = require("../../notification/notification.service");
const notification_model_1 = require("../../../database/model/notification.model");
const user_model_1 = require("../../../database/model/user.model");
const mongoose_1 = __importStar(require("mongoose"));
class CommentService {
    /**
     * Create comment securely and attach to post
     */
    async createComment(commentData, ownerId) {
        if (!commentData.postId || !mongoose_1.Types.ObjectId.isValid(commentData.postId)) {
            throw new error_response_1.BadRequestError("Valid postId is required");
        }
        if (!commentData.content || !commentData.content.trim()) {
            throw new error_response_1.BadRequestError("Comment content cannot be empty");
        }
        // 1. Verify post exists and allows comments
        const post = await post_1.Post.findById(commentData.postId);
        if (!post) {
            throw new error_response_1.NotFoundError("Target post not found");
        }
        if (post.allowComments === false) {
            throw new error_response_1.BadRequestError("Comments are disabled for this post");
        }
        // 2. Create comment with verified ownerId
        const newComment = new comment_model_1.Comment({
            content: commentData.content.trim(),
            postId: new mongoose_1.Types.ObjectId(commentData.postId),
            ownerId: new mongoose_1.Types.ObjectId(ownerId),
            mentions: commentData.mentions || [],
            imageUrl: commentData.imageUrl || [],
            replies: [],
        });
        await newComment.save();
        // 3. Update post's comments array atomically
        await post_1.Post.findByIdAndUpdate(commentData.postId, {
            $push: { comments: newComment._id },
        });
        // 4. Notify post owner if someone else commented
        if (post.ownerId && post.ownerId.toString() !== ownerId) {
            try {
                const commenter = await user_model_1.User.findById(ownerId);
                await notification_service_1.notificationService.createNotification({
                    recipient: post.ownerId.toString(),
                    sender: ownerId,
                    type: notification_model_1.NotificationType.POST_COMMENT,
                    postId: post._id,
                    message: `${commenter?.name || "Someone"} commented on your post`,
                });
            }
            catch (err) {
                console.error("Failed to create comment notification:", err);
            }
        }
        return await newComment.populate("ownerId", "name gender role avatar avatarUrl");
    }
    /**
     * Get all comments for a post
     */
    async getCommentsByPostId(postId) {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new error_response_1.BadRequestError("Valid postId is required");
        }
        return await comment_model_1.Comment.find({ postId: new mongoose_1.default.Types.ObjectId(postId) })
            .populate("ownerId", "name gender role avatar avatarUrl")
            .populate({
            path: "replies",
            populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
        })
            .sort({ createdAt: -1 });
    }
    /**
     * Get single comment by ID
     */
    async getCommentById(commentId) {
        if (!commentId || !mongoose_1.Types.ObjectId.isValid(commentId)) {
            throw new error_response_1.BadRequestError("Valid commentId is required");
        }
        const comment = await comment_model_1.Comment.findById(commentId)
            .populate("ownerId", "name gender role avatar avatarUrl")
            .populate({
            path: "replies",
            populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
        });
        if (!comment) {
            throw new error_response_1.NotFoundError("Comment not found");
        }
        return comment;
    }
    /**
     * Delete comment
     */
    async deleteComment(commentId, userId, role) {
        const comment = await comment_model_1.Comment.findById(commentId);
        if (!comment) {
            throw new error_response_1.NotFoundError("Comment not found");
        }
        if (comment.ownerId.toString() !== userId && role !== "ADMIN") {
            throw new error_response_1.UnauthorizedError("You are not authorized to delete this comment");
        }
        // Remove from post comments array
        await post_1.Post.findByIdAndUpdate(comment.postId, {
            $pull: { comments: comment._id },
        });
        await comment_model_1.Comment.findByIdAndDelete(commentId);
    }
}
exports.CommentService = CommentService;
exports.commentService = new CommentService();
