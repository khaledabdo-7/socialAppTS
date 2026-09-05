import Router, { Request, Response, NextFunction } from "express";
import { successResponse } from "../../common/response/success.response";
import { CommentService } from "./service/comment.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import mongoose from "mongoose";
// import { ObjectId } from "mongoose";

const commentRouter = Router();
const commentService = new CommentService();

commentRouter.post(
  "/create-comment",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentData = req.body;
      const newComment = await commentService.createComment(commentData);
      return successResponse(
        res,
        newComment,
        "Comment created successfully",
        201,
      );
    } catch (error) {
      next(error);
    }
  },
);

commentRouter.get(
  "/get-comments-by-post-id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const comments = await commentService.getCommentsByPostId(
        req.params.postId as string,
      );
      return successResponse(
        res,
        comments,
        "Comments retrieved successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

commentRouter.get(
  "/get-comment-by-id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const comment = await commentService.getCommentById(
        req.params.commentId as string,
      );
      return successResponse(
        res,
        comment,
        "Comment retrieved successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

export default commentRouter;
