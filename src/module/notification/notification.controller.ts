import Router, { Response, NextFunction } from "express";
import { notificationService } from "./notification.service";
import { authMiddleware } from "../../middleware/auth.middleware";
import { AuthRequest } from "../../common/interface/post.interface";
import { successResponse } from "../../common/response/success.response";

const notificationRouter = Router();

/**
 * GET /notification
 * Get user notifications
 */
notificationRouter.get(
  "/",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const data = await notificationService.getUserNotifications(
        req.user?.id as string,
        page,
        limit,
      );
      return successResponse(res, data, "Notifications retrieved", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * GET /notification/unread-count
 * Get count of unread notifications
 */
notificationRouter.get(
  "/unread-count",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const count = await notificationService.getUnreadCount(
        req.user?.id as string,
      );
      return successResponse(res, { unreadCount: count }, "Unread count retrieved", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /notification/read-all
 * Mark all as read
 */
notificationRouter.patch(
  "/read-all",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await notificationService.markAllAsRead(req.user?.id as string);
      return successResponse(res, null, "All notifications marked as read", 200);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * PATCH /notification/:id/read
 * Mark single notification as read
 */
notificationRouter.patch(
  "/:id/read",
  authMiddleware(),
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      await notificationService.markAsRead(req.user?.id as string, id);
      return successResponse(res, null, "Notification marked as read", 200);
    } catch (error) {
      next(error);
    }
  },
);

export default notificationRouter;
