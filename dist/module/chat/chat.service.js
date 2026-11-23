"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = exports.ChatService = void 0;
const message_model_1 = require("../../database/model/message.model");
const mongoose_1 = require("mongoose");
class ChatService {
    /**
     * Get paginated chat history between two users
     */
    async getChatHistory(userId, friendId, page = 1, limit = 50) {
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        const friendObjId = new mongoose_1.Types.ObjectId(friendId);
        const filter = {
            $or: [
                { senderId: userObjId, receiverId: friendObjId },
                { senderId: friendObjId, receiverId: userObjId },
            ],
        };
        const total = await message_model_1.MessageModel.countDocuments(filter);
        const messages = await message_model_1.MessageModel.find(filter)
            .sort({ createdAt: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .populate("senderId", "name gender avatar avatarUrl")
            .populate("receiverId", "name gender avatar avatarUrl");
        // Mark messages received from friend as read
        await message_model_1.MessageModel.updateMany({ senderId: friendObjId, receiverId: userObjId, read: false }, { $set: { read: true } });
        return { messages, total, page };
    }
    /**
     * Get all active recent conversations for a user
     */
    async getRecentConversations(userId) {
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        // Aggregate to find latest message per conversation
        const messages = await message_model_1.MessageModel.aggregate([
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
    async markMessagesAsRead(userId, friendId) {
        await message_model_1.MessageModel.updateMany({
            senderId: new mongoose_1.Types.ObjectId(friendId),
            receiverId: new mongoose_1.Types.ObjectId(userId),
            read: false,
        }, { $set: { read: true } });
    }
}
exports.ChatService = ChatService;
exports.chatService = new ChatService();
