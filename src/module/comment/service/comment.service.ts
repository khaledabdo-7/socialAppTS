import { Comment } from "../../../database/model/comment.model";
import { IComment } from "../../../common/interface/comment.interface";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

export class CommentService {
  public async createComment(
    commentData: Partial<IComment>,
  ): Promise<IComment> {
    const newComment = new Comment(commentData);
    await newComment.save();
    return newComment;
  }

  public async getCommentsByPostId(postId: string): Promise<IComment[]> {
    return await Comment.find({ postId });
  }

  public async getCommentById(commentId: string): Promise<IComment | null> {
    const comment = await Comment.findById(commentId);
    return comment;
  }
}
