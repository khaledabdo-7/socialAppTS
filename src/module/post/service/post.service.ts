import { Post } from "../../../database/model/post";
import { IPost } from "../../../common/interface/post.interface";
import { FriendModel } from "../../../database/model/friend.model";
import { FriendStatus } from "../../../common/enum/friend.enum";
import { ReactType } from "../../../common/enum/reacts.enum";
import {
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from "../../../common/response/error.response";
import { notificationService } from "../../notification/notification.service";
import { NotificationType } from "../../../database/model/notification.model";
import { User } from "../../../database/model/user.model";
import { Types } from "mongoose";

class PostService {
  /**
   * Create a new post
   */
  public async createPost(postData: Partial<IPost>): Promise<IPost> {
    if (!postData.title || !postData.content) {
      throw new BadRequestError("Post title and content are required");
    }

    const newPost = new Post({
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
  public async getFeed(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ posts: any[]; total: number; page: number }> {
    const userObjId = new Types.ObjectId(userId);

    // 1. Fetch user's accepted friends IDs
    const friends = await FriendModel.find({
      $or: [{ requester: userObjId }, { recipient: userObjId }],
      status: FriendStatus.ACCEPTED,
    });

    const friendIds = friends.map((f: any) =>
      f.requester.toString() === userId
        ? f.recipient
        : f.requester,
    );

    // Include the user themselves + friends
    const feedOwnerIds = [userObjId, ...friendIds];

    // If user has no friends yet, show all public posts so feed isn't completely empty!
    const query = feedOwnerIds.length > 1
      ? { ownerId: { $in: feedOwnerIds } }
      : {};

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
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
  public async getUserPosts(userId: string): Promise<IPost[]> {
    return await Post.find({ ownerId: new Types.ObjectId(userId) })
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
  public async getAllPosts(userId: string): Promise<IPost[]> {
    return this.getUserPosts(userId);
  }

  /**
   * Get single post by ID with full populated details
   */
  public async getPostById(postId: string): Promise<IPost> {
    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID");
    }

    const post = await Post.findById(postId)
      .populate("ownerId", "name gender role avatar avatarUrl bio")
      .populate("reaction.userId", "name avatar avatarUrl gender")
      .populate({
        path: "comments",
        options: { sort: { createdAt: -1 } },
        populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
      });

    if (!post) {
      throw new NotFoundError("Post not found");
    }

    return post;
  }

  /**
   * React to post (Like, Love, Haha, Wow, Sad, Angry) with smart toggle
   */
  public async toggleReaction(
    postId: string,
    userId: string,
    reactionType: ReactType | string,
  ): Promise<{ message: string; reactions: any[]; userReaction: string | null; total: number }> {
    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID");
    }

    const normalizedType = (reactionType || "").toString().toUpperCase() as ReactType;

    if (!Object.values(ReactType).includes(normalizedType)) {
      throw new BadRequestError(
        `Invalid reaction type: ${reactionType}. Allowed: ${Object.values(ReactType).join(", ")}`,
      );
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (!post.reaction) {
      post.reaction = [];
    }

    const userObjId = new Types.ObjectId(userId);
    const existingIndex = post.reaction.findIndex((r: any) => {
      const idStr = r.userId?._id ? r.userId._id.toString() : r.userId?.toString();
      return idStr === userId;
    });

    let userReaction: string | null = null;
    let actionMessage = "";

    if (existingIndex > -1 && post.reaction[existingIndex]) {
      const currentReaction = post.reaction[existingIndex]!;
      if (currentReaction.type === normalizedType) {
        // Same reaction clicked again -> remove reaction (toggle off)
        post.reaction.splice(existingIndex, 1);
        userReaction = null;
        actionMessage = "Reaction removed";
      } else {
        // Change to new reaction
        currentReaction.type = normalizedType;
        userReaction = normalizedType;
        actionMessage = "Reaction updated";
      }
    } else {
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
        const reactor = await User.findById(userId);
        await notificationService.createNotification({
          recipient: post.ownerId.toString(),
          sender: userId,
          type: NotificationType.POST_REACTION,
          postId: post._id,
          message: `${reactor?.name || "Someone"} reacted with ${userReaction} to your post`,
        });
      } catch (err) {
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
  public async updatePost(
    postId: string,
    userId: string,
    updateData: Partial<IPost>,
  ): Promise<IPost> {
    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (post.ownerId?.toString() !== userId) {
      throw new UnauthorizedError("You are not authorized to edit this post");
    }

    if (updateData.title) post.title = updateData.title;
    if (updateData.content) post.content = updateData.content;
    if (updateData.imageUrl !== undefined) post.imageUrl = updateData.imageUrl;
    if (updateData.allowComments !== undefined) post.allowComments = updateData.allowComments;
    if (updateData.tags !== undefined) post.tags = updateData.tags;

    await post.save();
    return await post.populate("ownerId", "name gender role avatar avatarUrl bio");
  }

  /**
   * Update post picture directly (server-side linking)
   */
  public async updatePostImage(
    postId: string,
    userId: string,
    imageUrl: string,
  ): Promise<IPost> {
    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Invalid post ID");
    }

    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (post.ownerId?.toString() !== userId) {
      throw new UnauthorizedError("You are not authorized to update this post's image");
    }

    post.imageUrl = imageUrl;
    await post.save();
    return await post.populate("ownerId", "name gender role avatar avatarUrl bio");
  }

  /**
   * Delete post
   */
  public async deletePost(postId: string, userId: string, role?: string): Promise<void> {
    const post = await Post.findById(postId);
    if (!post) {
      throw new NotFoundError("Post not found");
    }

    if (post.ownerId?.toString() !== userId && role !== "ADMIN") {
      throw new UnauthorizedError("You are not authorized to delete this post");
    }

    await Post.findByIdAndDelete(postId);
  }
}

export default new PostService();
export const postService = new PostService();
