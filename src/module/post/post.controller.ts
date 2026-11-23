import Router, { Response, NextFunction } from "express";
import { successResponse } from "../../common/response/success.response";
import { postService } from "./service/post.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { ReactType } from "../../common/enum/reacts.enum";
import { uploadService } from "../upload/service/upload.service";
import {
  postUploadMiddleware,
  extractFile,
} from "../upload/upload.middleware";
import { BadRequestError } from "../../common/response/error.response";

const postRouter = Router();

/**
 * POST /post/create-post
 * Create a new post. Supports multipart/form-data with attached image file,
 * uploading and linking the picture to the post server-side in ONE endpoint call.
 */
postRouter.post(
  "/create-post",
  authMiddleware(),
  postUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postData = { ...req.body };
      postData.ownerId = req.user?.id;

      // Handle attached picture if present
      const file = extractFile(req);
      if (file) {
        const uploadResult = await uploadService.uploadToStorage(
          file,
          "posts",
          "post",
          req,
        );
        postData.imageUrl = uploadResult.url;
      }

      // Format tags if sent as string in multipart
      if (typeof postData.tags === "string") {
        try {
          postData.tags = JSON.parse(postData.tags);
        } catch {
          postData.tags = postData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);
        }
      }

      // Format allowComments if sent as string in multipart
      if (typeof postData.allowComments === "string") {
        postData.allowComments = postData.allowComments !== "false";
      }

      const newPost = await postService.createPost(postData);
      return successResponse(res, newPost, "Post created successfully", 201);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST or PATCH /post/:id/image
 * Upload picture and link directly to an existing post server-side in ONE endpoint call
 */
postRouter.use(
  "/:id/image",
  authMiddleware(),
  postUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
      return next();
    }
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No post image file uploaded");
      }

      const postId = req.params.id as string;
      const result = await uploadService.uploadAndLinkPostPicture(
        req.user?.id as string,
        file,
        req,
        { postId },
      );

      return successResponse(
        res,
        result,
        "Post picture uploaded and linked successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /post/feed
 * Smart social feed (user posts + friends posts)
 */
postRouter.get(
  "/feed",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const feed = await postService.getFeed(req.user?.id as string, page, limit);
      return successResponse(res, feed, "Feed retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /post/get-posts (legacy route supporting feed or user posts)
 */
postRouter.get(
  "/get-posts",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.query.ownerId) {
        const posts = await postService.getUserPosts(req.query.ownerId as string);
        return successResponse(res, posts, "User posts retrieved successfully", 200);
      }
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const feed = await postService.getFeed(req.user?.id as string, page, limit);
      return successResponse(res, feed.posts, "Posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /post/user/:userId
 * Fetch posts of a specific user
 */
postRouter.get(
  "/user/:userId",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId as string;
      const posts = await postService.getUserPosts(userId);
      return successResponse(res, posts, "User posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /post/get-post-by-id and /post/get-post-by-id/:id
 * Legacy support for old client paths
 */
postRouter.get(
  ["/get-post-by-id", "/get-post-by-id/:id"],
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postId = (req.params.id || req.query.postId) as string;
      const post = await postService.getPostById(postId);
      return successResponse(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /post/:id/react and /post/react/:id
 * React to post (Like, Love, Haha, Wow, Sad, Angry)
 */
postRouter.post(
  ["/:id/react", "/react/:id"],
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = (req.params.id || req.params.postId) as string;
      const type = (req.body.type || req.body.reaction) as ReactType;
      const result = await postService.toggleReaction(
        id,
        req.user?.id as string,
        type,
      );
      return successResponse(res, result, result.message, 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /post/:id
 * Edit a post
 */
postRouter.patch(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const updatedPost = await postService.updatePost(
        id,
        req.user?.id as string,
        req.body,
      );
      return successResponse(res, updatedPost, "Post updated successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /post/:id
 * Delete a post
 */
postRouter.delete(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await postService.deletePost(
        id,
        req.user?.id as string,
        req.user?.role,
      );
      return successResponse(res, null, "Post deleted successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /post/:id
 * RESTful get post by id
 */
postRouter.get(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const post = await postService.getPostById(id);
      return successResponse(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

export default postRouter;
