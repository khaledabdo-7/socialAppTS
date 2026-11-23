"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const notification_model_1 = require("../../database/model/notification.model");
const mongoose_1 = require("mongoose");
class NotificationService {
    /**
     * Create notification and optionally push via socket
     */
    async createNotification(data) {
        // Don't notify yourself!
        if (data.recipient.toString() === data.sender.toString()) {
            return null;
        }
        const notification = new notification_model_1.NotificationModel({
            recipient: new mongoose_1.Types.ObjectId(data.recipient),
            sender: new mongoose_1.Types.ObjectId(data.sender),
            type: data.type,
            postId: data.postId ? new mongoose_1.Types.ObjectId(data.postId) : undefined,
            message: data.message,
            read: false,
        });
        await notification.save();
        return await notification.populate("sender", "name avatar avatarUrl gender");
    }
    /**
     * Get paginated notifications for current user
     */
    async getUserNotifications(userId, page = 1, limit = 20) {
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        const total = await notification_model_1.NotificationModel.countDocuments({ recipient: userObjId });
        const unreadCount = await notification_model_1.NotificationModel.countDocuments({
            recipient: userObjId,
            read: false,
        });
        const notifications = await notification_model_1.NotificationModel.find({ recipient: userObjId })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("sender", "name avatar avatarUrl gender")
            .populate("postId", "title");
        return { notifications, total, unreadCount };
    }
    /**
     * Get unread count
     */
    async getUnreadCount(userId) {
        return await notification_model_1.NotificationModel.countDocuments({
            recipient: new mongoose_1.Types.ObjectId(userId),
            read: false,
        });
    }
    /**
     * Mark single notification as read
     */
    async markAsRead(userId, notificationId) {
        await notification_model_1.NotificationModel.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(notificationId),
            recipient: new mongoose_1.Types.ObjectId(userId),
        }, { $set: { read: true } });
    }
    /**
     * Mark all notifications as read
     */
    async markAllAsRead(userId) {
        await notification_model_1.NotificationModel.updateMany({ recipient: new mongoose_1.Types.ObjectId(userId), read: false }, { $set: { read: true } });
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
