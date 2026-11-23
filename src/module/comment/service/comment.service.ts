import { Comment } from "../../../database/model/comment.model";
import { Post } from "../../../database/model/post";
import { IComment } from "../../../common/interface/comment.interface";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../../common/response/error.response";
import { notificationService } from "../../notification/notification.service";
import { NotificationType } from "../../../database/model/notification.model";
import { User } from "../../../database/model/user.model";
import mongoose, { Types } from "mongoose";

export class CommentService {
  /**
   * Create comment securely and attach to post
   */
  public async createComment(
    commentData: Partial<IComment> & { postId: string; content: string },
    ownerId: string,
  ): Promise<IComment> {
    if (!commentData.postId || !Types.ObjectId.isValid(commentData.postId)) {
      throw new BadRequestError("Valid postId is required");
    }

    if (!commentData.content || !commentData.content.trim()) {
      throw new BadRequestError("Comment content cannot be empty");
    }

    // 1. Verify post exists and allows comments
    const post = await Post.findById(commentData.postId);
    if (!post) {
      throw new NotFoundError("Target post not found");
    }

    if (post.allowComments === false) {
      throw new BadRequestError("Comments are disabled for this post");
    }

    // 2. Create comment with verified ownerId
    const newComment = new Comment({
      content: commentData.content.trim(),
      postId: new Types.ObjectId(commentData.postId),
      ownerId: new Types.ObjectId(ownerId),
      mentions: commentData.mentions || [],
      imageUrl: commentData.imageUrl || [],
      replies: [],
    });

    await newComment.save();

    // 3. Update post's comments array atomically
    await Post.findByIdAndUpdate(commentData.postId, {
      $push: { comments: newComment._id },
    });

    // 4. Notify post owner if someone else commented
    if (post.ownerId && post.ownerId.toString() !== ownerId) {
      try {
        const commenter = await User.findById(ownerId);
        await notificationService.createNotification({
          recipient: post.ownerId.toString(),
          sender: ownerId,
          type: NotificationType.POST_COMMENT,
          postId: post._id,
          message: `${commenter?.name || "Someone"} commented on your post`,
        });
      } catch (err) {
        console.error("Failed to create comment notification:", err);
      }
    }

    return await newComment.populate("ownerId", "name gender role avatar avatarUrl");
  }

  /**
   * Get all comments for a post
   */
  public async getCommentsByPostId(postId: string): Promise<IComment[]> {
    if (!postId || !Types.ObjectId.isValid(postId)) {
      throw new BadRequestError("Valid postId is required");
    }

    return await Comment.find({ postId: new mongoose.Types.ObjectId(postId) })
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
  public async getCommentById(commentId: string): Promise<IComment | null> {
    if (!commentId || !Types.ObjectId.isValid(commentId)) {
      throw new BadRequestError("Valid commentId is required");
    }

    const comment = await Comment.findById(commentId)
      .populate("ownerId", "name gender role avatar avatarUrl")
      .populate({
        path: "replies",
        populate: { path: "ownerId", select: "name gender avatar avatarUrl" },
      });

    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    return comment;
  }

  /**
   * Delete comment
   */
  public async deleteComment(
    commentId: string,
    userId: string,
    role?: string,
  ): Promise<void> {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new NotFoundError("Comment not found");
    }

    if (comment.ownerId.toString() !== userId && role !== "ADMIN") {
      throw new UnauthorizedError("You are not authorized to delete this comment");
    }

    // Remove from post comments array
    await Post.findByIdAndUpdate(comment.postId, {
      $pull: { comments: comment._id },
    });

    await Comment.findByIdAndDelete(commentId);
  }
}

export const commentService = new CommentService();
