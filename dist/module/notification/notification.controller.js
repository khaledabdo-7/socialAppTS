"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notification_service_1 = require("./notification.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_response_1 = require("../../common/response/success.response");
const notificationRouter = (0, express_1.default)();
/**
 * GET /notification
 * Get user notifications
 */
notificationRouter.get("/", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const data = await notification_service_1.notificationService.getUserNotifications(req.user?.id, page, limit);
        return (0, success_response_1.successResponse)(res, data, "Notifications retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /notification/unread-count
 * Get count of unread notifications
 */
notificationRouter.get("/unread-count", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const count = await notification_service_1.notificationService.getUnreadCount(req.user?.id);
        return (0, success_response_1.successResponse)(res, { unreadCount: count }, "Unread count retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /notification/read-all
 * Mark all as read
 */
notificationRouter.patch("/read-all", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        await notification_service_1.notificationService.markAllAsRead(req.user?.id);
        return (0, success_response_1.successResponse)(res, null, "All notifications marked as read", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /notification/:id/read
 * Mark single notification as read
 */
notificationRouter.patch("/:id/read", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const id = req.params.id;
        await notification_service_1.notificationService.markAsRead(req.user?.id, id);
        return (0, success_response_1.successResponse)(res, null, "Notification marked as read", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = notificationRouter;
