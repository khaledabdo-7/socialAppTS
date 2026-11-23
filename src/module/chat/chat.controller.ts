import Router, { Response, NextFunction } from "express";
import { chatService } from "./chat.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { successResponse } from "../../common/response/success.response";

const chatRouter = Router();

/**
 * GET /chat/history/:friendId
 * Get conversation history with a friend
 */
chatRouter.get(
  "/history/:friendId",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const friendId = req.params.friendId as string;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 50;

      const history = await chatService.getChatHistory(
        userId,
        friendId,
        page,
        limit,
      );
      return successResponse(res, history, "Chat history retrieved", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /chat/conversations
 * Get recent conversations list
 */
chatRouter.get(
  "/conversations",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const conversations = await chatService.getRecentConversations(userId);
      return successResponse(
        res,
        conversations,
        "Conversations list retrieved",
        200,
      );
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /chat/read/:friendId
 * Mark incoming messages from friend as read
 */
chatRouter.patch(
  "/read/:friendId",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id as string;
      const friendId = req.params.friendId as string;
      await chatService.markMessagesAsRead(userId, friendId);
      return successResponse(res, null, "Messages marked as read", 200);
    } catch (error) {
      next(error);
    }
  },
);

export default chatRouter;
