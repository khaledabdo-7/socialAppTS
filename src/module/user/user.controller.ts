import Router, { Response, NextFunction } from "express";
import { userService } from "./service/user.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { successResponse } from "../../common/response/success.response";
import { BadRequestError } from "../../common/response/error.response";
import { uploadService } from "../upload/service/upload.service";
import {
  profileUploadMiddleware,
  extractFile,
} from "../upload/upload.middleware";

const userRouter = Router();

/**
 * POST or PATCH /user/profile-picture (alias /user/avatar)
 * Uploads avatar image and links directly to user profile server-sided in one call
 */
userRouter.use(
  ["/profile-picture", "/avatar"],
  authMiddleware(),
  profileUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
      return next();
    }
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No profile image file uploaded");
      }

      const result = await uploadService.uploadAndLinkProfilePicture(
        req.user?.id as string,
        file,
        req,
        "avatar",
      );

      return successResponse(
        res,
        result,
        "Profile picture uploaded and linked successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST or PATCH /user/cover-picture
 * Uploads cover photo and links directly to user profile server-sided in one call
 */
userRouter.use(
  "/cover-picture",
  authMiddleware(),
  profileUploadMiddleware,
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.method !== "POST" && req.method !== "PATCH") {
      return next();
    }
    try {
      const file = extractFile(req);
      if (!file) {
        throw new BadRequestError("No cover image file uploaded");
      }

      const result = await uploadService.uploadAndLinkProfilePicture(
        req.user?.id as string,
        file,
        req,
        "cover",
      );

      return successResponse(
        res,
        result,
        "Cover picture uploaded and linked successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /user/me
 * Get current user profile
 */
userRouter.get(
  "/me",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await userService.getUserById(req.user?.id as string);
      return successResponse(res, user, "User fetched successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /user/search?q=...
 * Search users by name or email
 */
userRouter.get(
  "/search",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const query = (req.query.q || req.query.query || "") as string;
      const limit = Number(req.query.limit) || 20;
      const results = await userService.searchUsers(
        query,
        req.user?.id as string,
        limit,
      );
      return successResponse(res, results, "Search results retrieved", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /user/suggestions
 * Discover new users to connect with
 */
userRouter.get(
  "/suggestions",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 8;
      const suggestions = await userService.getSuggestions(
        req.user?.id as string,
        limit,
      );
      return successResponse(
        res,
        suggestions,
        "Friend suggestions retrieved",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /user/update-profile
 * Update profile details (bio, avatar, coverImage, name, gender)
 */
userRouter.patch(
  "/update-profile",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await userService.updateProfile(
        req.user?.id as string,
        req.body,
      );
      return successResponse(res, updated, "Profile updated successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /user/:id
 * Get profile of specific user
 */
userRouter.get(
  "/:id",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const user = await userService.getUserById(id, req.user?.id as string);
      return successResponse(
        res,
        user,
        "User profile fetched successfully",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

export default userRouter;
