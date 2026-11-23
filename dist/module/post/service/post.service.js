"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postService = void 0;
const post_1 = require("../../../database/model/post");
const friend_model_1 = require("../../../database/model/friend.model");
const friend_enum_1 = require("../../../common/enum/friend.enum");
const reacts_enum_1 = require("../../../common/enum/reacts.enum");
const error_response_1 = require("../../../common/response/error.response");
const notification_service_1 = require("../../notification/notification.service");
const notification_model_1 = require("../../../database/model/notification.model");
const user_model_1 = require("../../../database/model/user.model");
const mongoose_1 = require("mongoose");
class PostService {
    /**
     * Create a new post
     */
    async createPost(postData) {
        if (!postData.title || !postData.content) {
            throw new error_response_1.BadRequestError("Post title and content are required");
        }
        const newPost = new post_1.Post({
            ...postData,
            reaction: [],
            comments: [],
        });
        await newPost.save();
        return await newPost.populate("ownerId", "name gender role avatar avatarUrl bio");
    }
    /**
     * Get smart social feed: user's posts + accepted friends' posts
     */
    async getFeed(userId, page = 1, limit = 20) {
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        // 1. Fetch user's accepted friends IDs
        const friends = await friend_model_1.FriendModel.find({
            $or: [{ requester: userObjId }, { recipient: userObjId }],
            status: friend_enum_1.FriendStatus.ACCEPTED,
        });
        const friendIds = friends.map((f) => f.requester.toString() === userId
            ? f.recipient
            : f.requester);
        // Include the user themselves + friends
        const feedOwnerIds = [userObjId, ...friendIds];
        // If user has no friends yet, show all public posts so feed isn't completely empty!
        const query = feedOwnerIds.length > 1
            ? { ownerId: { $in: feedOwnerIds } }
            : {};
        const total = await post_1.Post.countDocuments(query);
        const posts = await post_1.Post.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("ownerId", "name gender role avatar avatarUrl bio")
            .populate("reaction.userId", "name avatar avatarUrl gender")
            .populate({
            path: "comments",
            options: { sort: { createdAt: -1 }, limit: 5 },
            populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
        });
        return { posts, total, page };
    }
    /**
     * Get all posts created by a specific user (for Profile page)
     */
    async getUserPosts(userId) {
        return await post_1.Post.find({ ownerId: new mongoose_1.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .populate("ownerId", "name gender role avatar avatarUrl bio")
            .populate("reaction.userId", "name avatar avatarUrl gender")
            .populate({
            path: "comments",
            options: { sort: { createdAt: -1 }, limit: 5 },
            populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
        });
    }
    /**
     * Legacy alias
     */
    async getAllPosts(userId) {
        return this.getUserPosts(userId);
    }
    /**
     * Get single post by ID with full populated details
     */
    async getPostById(postId) {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new error_response_1.BadRequestError("Invalid post ID");
        }
        const post = await post_1.Post.findById(postId)
            .populate("ownerId", "name gender role avatar avatarUrl bio")
            .populate("reaction.userId", "name avatar avatarUrl gender")
            .populate({
            path: "comments",
            options: { sort: { createdAt: -1 } },
            populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
        });
        if (!post) {
            throw new error_response_1.NotFoundError("Post not found");
        }
        return post;
    }
    /**
     * React to post (Like, Love, Haha, Wow, Sad, Angry) with smart toggle
     */
    async toggleReaction(postId, userId, reactionType) {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new error_response_1.BadRequestError("Invalid post ID");
        }
        const normalizedType = (reactionType || "").toString().toUpperCase();
        if (!Object.values(reacts_enum_1.ReactType).includes(normalizedType)) {
            throw new error_response_1.BadRequestError(`Invalid reaction type: ${reactionType}. Allowed: ${Object.values(reacts_enum_1.ReactType).join(", ")}`);
        }
        const post = await post_1.Post.findById(postId);
        if (!post) {
            throw new error_response_1.NotFoundError("Post not found");
        }
        if (!post.reaction) {
            post.reaction = [];
        }
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        const existingIndex = post.reaction.findIndex((r) => {
            const idStr = r.userId?._id ? r.userId._id.toString() : r.userId?.toString();
            return idStr === userId;
        });
        let userReaction = null;
        let actionMessage = "";
        if (existingIndex > -1 && post.reaction[existingIndex]) {
            const currentReaction = post.reaction[existingIndex];
            if (currentReaction.type === normalizedType) {
                // Same reaction clicked again -> remove reaction (toggle off)
                post.reaction.splice(existingIndex, 1);
                userReaction = null;
                actionMessage = "Reaction removed";
            }
            else {
                // Change to new reaction
                currentReaction.type = normalizedType;
                userReaction = normalizedType;
                actionMessage = "Reaction updated";
            }
        }
        else {
            // Add new reaction
            post.reaction.push({ userId: userObjId, type: normalizedType });
            userReaction = normalizedType;
            actionMessage = "Reaction added";
        }
        await post.save();
        await post.populate("reaction.userId", "name avatar avatarUrl gender");
        // Trigger notification to post owner if someone else reacted
        if (userReaction && post.ownerId && post.ownerId.toString() !== userId) {
            try {
                const reactor = await user_model_1.User.findById(userId);
                await notification_service_1.notificationService.createNotification({
                    recipient: post.ownerId.toString(),
                    sender: userId,
                    type: notification_model_1.NotificationType.POST_REACTION,
                    postId: post._id,
                    message: `${reactor?.name || "Someone"} reacted with ${userReaction} to your post`,
                });
            }
            catch (err) {
                console.error("Failed to create reaction notification:", err);
            }
        }
        return {
            message: actionMessage,
            reactions: post.reaction || [],
            userReaction,
            total: post.reaction.length,
        };
    }
    /**
     * Update post (Edit Post)
     */
    async updatePost(postId, userId, updateData) {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new error_response_1.BadRequestError("Invalid post ID");
        }
        const post = await post_1.Post.findById(postId);
        if (!post) {
            throw new error_response_1.NotFoundError("Post not found");
        }
        if (post.ownerId?.toString() !== userId) {
            throw new error_response_1.UnauthorizedError("You are not authorized to edit this post");
        }
        if (updateData.title)
            post.title = updateData.title;
        if (updateData.content)
            post.content = updateData.content;
        if (updateData.imageUrl !== undefined)
            post.imageUrl = updateData.imageUrl;
        if (updateData.allowComments !== undefined)
            post.allowComments = updateData.allowComments;
        if (updateData.tags !== undefined)
            post.tags = updateData.tags;
        await post.save();
        return await post.populate("ownerId", "name gender role avatar avatarUrl bio");
    }
    /**
     * Update post picture directly (server-side linking)
     */
    async updatePostImage(postId, userId, imageUrl) {
        if (!postId || !mongoose_1.Types.ObjectId.isValid(postId)) {
            throw new error_response_1.BadRequestError("Invalid post ID");
        }
        const post = await post_1.Post.findById(postId);
        if (!post) {
            throw new error_response_1.NotFoundError("Post not found");
        }
        if (post.ownerId?.toString() !== userId) {
            throw new error_response_1.UnauthorizedError("You are not authorized to update this post's image");
        }
        post.imageUrl = imageUrl;
        await post.save();
        return await post.populate("ownerId", "name gender role avatar avatarUrl bio");
    }
    /**
     * Delete post
     */
    async deletePost(postId, userId, role) {
        const post = await post_1.Post.findById(postId);
        if (!post) {
            throw new error_response_1.NotFoundError("Post not found");
        }
        if (post.ownerId?.toString() !== userId && role !== "ADMIN") {
            throw new error_response_1.UnauthorizedError("You are not authorized to delete this post");
        }
        await post_1.Post.findByIdAndDelete(postId);
    }
}
exports.default = new PostService();
exports.postService = new PostService();
