import { MessageModel, IMessage } from "../../database/model/message.model";
import { User } from "../../database/model/user.model";
import { Types } from "mongoose";
import { NotFoundError } from "../../common/response/error.response";

export class ChatService {
  /**
   * Get paginated chat history between two users
   */
  public async getChatHistory(
    userId: string,
    friendId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ messages: IMessage[]; total: number; page: number }> {
    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    const filter = {
      $or: [
        { senderId: userObjId, receiverId: friendObjId },
        { senderId: friendObjId, receiverId: userObjId },
      ],
    };

    const total = await MessageModel.countDocuments(filter);
    const messages = await MessageModel.find(filter)
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId", "name gender avatar avatarUrl")
      .populate("receiverId", "name gender avatar avatarUrl");

    // Mark messages received from friend as read
    await MessageModel.updateMany(
      { senderId: friendObjId, receiverId: userObjId, read: false },
      { $set: { read: true } },
    );

    return { messages, total, page };
  }

  /**
   * Get all active recent conversations for a user
   */
  public async getRecentConversations(userId: string): Promise<any[]> {
    const userObjId = new Types.ObjectId(userId);

    // Aggregate to find latest message per conversation
    const messages = await MessageModel.aggregate([
      {
        $match: {
          $or: [{ senderId: userObjId }, { receiverId: userObjId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", userObjId] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$message" },
          lastMessageTime: { $first: "$createdAt" },
          lastSenderId: { $first: "$senderId" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", userObjId] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $project: {
          friendId: "$_id",
          friendName: "$userInfo.name",
          friendGender: "$userInfo.gender",
          lastMessage: 1,
          lastMessageTime: 1,
          lastSenderId: 1,
          unreadCount: 1,
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return messages;
  }

  /**
   * Mark messages as read
   */
  public async markMessagesAsRead(userId: string, friendId: string): Promise<void> {
    await MessageModel.updateMany(
      {
        senderId: new Types.ObjectId(friendId),
        receiverId: new Types.ObjectId(userId),
        read: false,
      },
      { $set: { read: true } },
    );
  }
}

export const chatService = new ChatService();
