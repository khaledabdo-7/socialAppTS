import Router, { Request, Response, NextFunction } from "express";
import { successResponse } from "../../common/response/success.response";
import { validationMiddleware } from "../../middleware/validation.middleware";
import { PostService } from "./service/post.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";

const postRouter = Router();
const postService = new PostService();

postRouter.post(
  "/create-post",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const postData = req.body;
      console.log("Post data in controller:", postData); // Log the post data to verify its structure
      postData.ownerId = req.user?.id;
        console.log("Owner ID in controller:", postData.ownerId); // Log the owner ID to verify its structure
      const newPost = await postService.createPost(postData);
      return successResponse(res, newPost, "Post created successfully", 201);
    } catch (error) {
      next(error);
    }
  },
);

postRouter.get(
  "/get-posts",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const posts = await postService.getPosts(req.user?.id as string);
      return successResponse(res, posts, "Posts retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

postRouter.get(
  "/get-post-by-id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const post = await postService.getPostById(req.params.postId as string);
      return successResponse(res, post, "Post retrieved successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

export default postRouter;
