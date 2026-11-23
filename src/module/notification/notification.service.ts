import {
  NotificationModel,
  NotificationType,
  INotification,
} from "../../database/model/notification.model";
import { Types } from "mongoose";

export class NotificationService {
  /**
   * Create notification and optionally push via socket
   */
  public async createNotification(data: {
    recipient: string | Types.ObjectId;
    sender: string | Types.ObjectId;
    type: NotificationType;
    postId?: string | Types.ObjectId;
    message: string;
  }): Promise<INotification | null> {
    // Don't notify yourself!
    if (data.recipient.toString() === data.sender.toString()) {
      return null;
    }

    const notification = new NotificationModel({
      recipient: new Types.ObjectId(data.recipient),
      sender: new Types.ObjectId(data.sender),
      type: data.type,
      postId: data.postId ? new Types.ObjectId(data.postId) : undefined,
      message: data.message,
      read: false,
    });

    await notification.save();
    return await notification.populate("sender", "name avatar avatarUrl gender");
  }

  /**
   * Get paginated notifications for current user
   */
  public async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ notifications: INotification[]; total: number; unreadCount: number }> {
    const userObjId = new Types.ObjectId(userId);

    const total = await NotificationModel.countDocuments({ recipient: userObjId });
    const unreadCount = await NotificationModel.countDocuments({
      recipient: userObjId,
      read: false,
    });

    const notifications = await NotificationModel.find({ recipient: userObjId })
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
  public async getUnreadCount(userId: string): Promise<number> {
    return await NotificationModel.countDocuments({
      recipient: new Types.ObjectId(userId),
      read: false,
    });
  }

  /**
   * Mark single notification as read
   */
  public async markAsRead(userId: string, notificationId: string): Promise<void> {
    await NotificationModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(notificationId),
        recipient: new Types.ObjectId(userId),
      },
      { $set: { read: true } },
    );
  }

  /**
   * Mark all notifications as read
   */
  public async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { recipient: new Types.ObjectId(userId), read: false },
      { $set: { read: true } },
    );
  }
}

export const notificationService = new NotificationService();
