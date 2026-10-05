import { Comment } from "../../../database/model/comment.model";
import { IComment } from "../../../common/interface/comment.interface";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { DatabaseRepository } from "../../../database/repositories/database.repositorie";

export class CommentService {
  private commentRepository: DatabaseRepository<IComment>;
  constructor() {
    this.commentRepository = new DatabaseRepository(Comment);
  }

  public async createComment(
    commentData: Partial<IComment>,
  ): Promise<IComment> {
    const newComment = new Comment(commentData);
    await newComment.save();
    return newComment;
  }

  public async getCommentsByPostId(postId: ObjectId): Promise<IComment[]> {
    return await this.commentRepository.findOne({ filter: { postId } });
  }

  public async getCommentById(commentId: ObjectId): Promise<IComment | null> {
    const comment = await this.commentRepository.findOne({
      filter: { commentId },
    });
    return comment;
  }
}
