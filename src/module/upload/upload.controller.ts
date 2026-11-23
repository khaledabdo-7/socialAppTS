import Router, { Response, NextFunction } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { successResponse } from "../../common/response/success.response";
import { BadRequestError } from "../../common/response/error.response";
import { uploadService } from "./service/upload.service";
import {
  profileUploadMiddleware,
  postUploadMiddleware,
  extractFile,
} from "./upload.middleware";

const uploadRouter = Router();

/**
 * POST /upload/profile-picture (aliases: /profile-pic, /avatar)
 * Uploads user profile/avatar picture and links it directly to the user in the database.
 * Fully server-sided single endpoint call.
 */
uploadRouter.post(
  ["/profile-picture", "/profile-pic", "/avatar"],
  authMiddleware(),
  profileUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No profile image file uploaded");
      }

      const type = (req.body.type === "cover" ? "cover" : "avatar") as "avatar" | "cover";
      const result = await uploadService.uploadAndLinkProfilePicture(
        req.user?.id as string,
        file,
        req,
        type,
      );

      return successResponse(
        res,
        result,
        `${type === "cover" ? "Cover" : "Profile"} picture uploaded and linked successfully`,
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /upload/post-picture (aliases: /post-pic, /post-image)
 * Uploads a post picture with post-specific logic and links it directly to a post on the server-side.
 * If postId is provided, links to that post.
 * If title & content are provided, creates the post and links the image in one call.
 * If neither is provided, returns the uploaded post media URL.
 */
uploadRouter.post(
  ["/post-picture", "/post-pic", "/post-image"],
  authMiddleware(),
  postUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No post image file uploaded");
      }

      const postId = req.body.postId || (req.query.postId as string);
      const result = await uploadService.uploadAndLinkPostPicture(
        req.user?.id as string,
        file,
        req,
        {
          postId,
          postData: req.body,
        },
      );

      const status = result.post && !postId ? 201 : 200;
      return successResponse(
        res,
        result,
        result.post
          ? "Post picture uploaded and linked successfully"
          : "Post image uploaded successfully",
        status,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /upload/image
 * Legacy backward compatibility route
 */
uploadRouter.post(
  "/image",
  authMiddleware(),
  postUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No image file uploaded");
      }

      const uploadResult = await uploadService.uploadToStorage(
        file,
        "general",
        "img",
        req,
      );

      return successResponse(
        res,
        uploadResult,
        "Image uploaded successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

export default uploadRouter;
