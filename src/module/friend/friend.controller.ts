import Router, { Response, NextFunction } from "express";
import { friendService } from "./service/friend.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { successResponse } from "../../common/response/success.response";

const friendRouter = Router();

/**
 * POST /friend/send
 * Send a friend request
 */
friendRouter.post(
  "/send",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const requesterId = req.user?.id as string;
      const { recipientId } = req.body;
      const result = await friendService.sendFriendRequest(requesterId, recipientId);
      return successResponse(res, result, "Friend request sent", 201);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /friend/accept
 * Accept a friend request
 */
friendRouter.post(
  "/accept",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const recipientId = req.user?.id as string;
      const { requesterId } = req.body;
      const result = await friendService.acceptFriendRequest(requesterId, recipientId);
      return successResponse(res, result, "Friend request accepted", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * POST /friend/reject
 * Reject a friend request
 */
friendRouter.post(
  "/reject",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const recipientId = req.user?.id as string;
      const { requesterId } = req.body;
      const result = await friendService.rejectFriendRequest(requesterId, recipientId);
      return successResponse(res, result, "Friend request rejected", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * DELETE /friend/unfriend/:friendId
 * Unfriend or cancel friend request
 */
friendRouter.delete(
  "/unfriend/:friendId",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const friendId = req.params.friendId as string;
      await friendService.unfriend(userId, friendId);
      return successResponse(res, null, "Friend removed successfully", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /friend/list
 * Get accepted friends and pending requests
 */
friendRouter.get(
  "/list",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const result = await friendService.getFriends(userId);
      return successResponse(res, result, "Friends list fetched", 200);
    } catch (error) {
      next(error);
    }
  },
);

export default friendRouter;
