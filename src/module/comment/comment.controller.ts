import Router, { Response, NextFunction } from "express";
import { successResponse } from "../../common/response/success.response";
import { commentService } from "./service/comment.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";

const commentRouter = Router();

/**
 * POST /comment/create-comment
 * Create comment with verified owner
 */
commentRouter.post(
  "/create-comment",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentData = req.body;
      const ownerId = req.user?.id as string;
      const newComment = await commentService.createComment(commentData, ownerId);
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

/**
 * GET /comment/post/:postId
 * RESTful get comments by post ID
 */
commentRouter.get(
  "/post/:postId",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postId = req.params.postId as string;
      const comments = await commentService.getCommentsByPostId(postId);
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

/**
 * GET /comment/get-comments-by-post-id and /comment/get-comments-by-post-id/:postId
 * Backward compatibility alias
 */
commentRouter.get(
  ["/get-comments-by-post-id", "/get-comments-by-post-id/:postId"],
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postId = (req.params.postId || req.query.postId) as string;
      const comments = await commentService.getCommentsByPostId(postId);
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

/**
 * GET /comment/get-comment-by-id and /comment/get-comment-by-id/:commentId
 * Backward compatibility alias
 */
commentRouter.get(
  ["/get-comment-by-id", "/get-comment-by-id/:commentId"],
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = (req.params.commentId || req.query.commentId) as string;
      const comment = await commentService.getCommentById(commentId);
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

/**
 * DELETE /comment/:id
 * Delete comment
 */
commentRouter.delete(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id as string;
      await commentService.deleteComment(
        commentId,
        req.user?.id as string,
        req.user?.role,
      );
      return successResponse(res, null, "Comment deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /comment/:id
 * RESTful get comment by ID
 */
commentRouter.get(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id as string;
      const comment = await commentService.getCommentById(commentId);
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
