"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendService = exports.FriendService = void 0;
const friend_model_1 = require("../../../database/model/friend.model");
const friend_enum_1 = require("../../../common/enum/friend.enum");
const user_model_1 = require("../../../database/model/user.model");
const error_response_1 = require("../../../common/response/error.response");
const notification_service_1 = require("../../notification/notification.service");
const notification_model_1 = require("../../../database/model/notification.model");
const mongoose_1 = require("mongoose");
class FriendService {
    /**
     * Send friend request with self-check & state verification
     */
    async sendFriendRequest(requesterId, recipientId) {
        if (!recipientId || !mongoose_1.Types.ObjectId.isValid(recipientId)) {
            throw new error_response_1.BadRequestError("Valid recipientId is required");
        }
        if (requesterId.toString() === recipientId.toString()) {
            throw new error_response_1.BadRequestError("You cannot send a friend request to yourself");
        }
        const existingRequester = await user_model_1.User.findById(requesterId);
        const existingRecipient = await user_model_1.User.findById(recipientId);
        if (!existingRequester || !existingRecipient) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const existingFriend = await friend_model_1.FriendModel.findOne({
            $or: [
                { requester: requesterId, recipient: recipientId },
                { requester: recipientId, recipient: requesterId },
            ],
        });
        if (existingFriend) {
            if (existingFriend.status === friend_enum_1.FriendStatus.ACCEPTED) {
                throw new error_response_1.BadRequestError("You are already friends");
            }
            if (existingFriend.status === friend_enum_1.FriendStatus.PENDING) {
                throw new error_response_1.BadRequestError("A friend request is already pending");
            }
            // If previously rejected, reopen the request
            existingFriend.requester = new mongoose_1.Types.ObjectId(requesterId);
            existingFriend.recipient = new mongoose_1.Types.ObjectId(recipientId);
            existingFriend.status = friend_enum_1.FriendStatus.PENDING;
            await existingFriend.save();
            return existingFriend;
        }
        const friend = new friend_model_1.FriendModel({
            requester: new mongoose_1.Types.ObjectId(requesterId),
            recipient: new mongoose_1.Types.ObjectId(recipientId),
            status: friend_enum_1.FriendStatus.PENDING,
        });
        await friend.save();
        // Trigger notification to recipient
        await notification_service_1.notificationService.createNotification({
            recipient: recipientId,
            sender: requesterId,
            type: notification_model_1.NotificationType.FRIEND_REQUEST,
            message: `${existingRequester.name} sent you a friend request`,
        });
        return friend;
    }
    /**
     * Accept friend request
     */
    async acceptFriendRequest(requesterId, recipientId) {
        const friend = await friend_model_1.FriendModel.findOneAndUpdate({
            requester: new mongoose_1.Types.ObjectId(requesterId),
            recipient: new mongoose_1.Types.ObjectId(recipientId),
            status: friend_enum_1.FriendStatus.PENDING,
        }, {
            $set: {
                status: friend_enum_1.FriendStatus.ACCEPTED,
            },
        }, { new: true });
        if (!friend) {
            throw new error_response_1.NotFoundError("Friend request not found or already handled");
        }
        const recipientUser = await user_model_1.User.findById(recipientId);
        await notification_service_1.notificationService.createNotification({
            recipient: requesterId,
            sender: recipientId,
            type: notification_model_1.NotificationType.FRIEND_ACCEPT,
            message: `${recipientUser?.name || "A user"} accepted your friend request`,
        });
        return friend;
    }
    /**
     * Reject friend request
     */
    async rejectFriendRequest(requesterId, recipientId) {
        const friend = await friend_model_1.FriendModel.findOneAndUpdate({
            requester: new mongoose_1.Types.ObjectId(requesterId),
            recipient: new mongoose_1.Types.ObjectId(recipientId),
            status: friend_enum_1.FriendStatus.PENDING,
        }, {
            $set: {
                status: friend_enum_1.FriendStatus.REJECTED,
            },
        }, { new: true });
        if (!friend) {
            throw new error_response_1.NotFoundError("Friend request not found or already handled");
        }
        const recipientUser = await user_model_1.User.findById(recipientId);
        await notification_service_1.notificationService.createNotification({
            recipient: requesterId,
            sender: recipientId,
            type: notification_model_1.NotificationType.FRIEND_ACCEPT,
            message: `${recipientUser?.name || "A user"} accepted your friend request`,
        });
        return friend;
    }
    /**
     * Unfriend or cancel request
     */
    async unfriend(userId, friendId) {
        const userObjId = new mongoose_1.Types.ObjectId(userId);
        const friendObjId = new mongoose_1.Types.ObjectId(friendId);
        const result = await friend_model_1.FriendModel.findOneAndDelete({
            $or: [
                { requester: userObjId, recipient: friendObjId },
                { requester: friendObjId, recipient: userObjId },
            ],
        });
        if (!result) {
            throw new error_response_1.NotFoundError("Friendship relation not found");
        }
    }
    /**
     * Get all accepted friends, incoming pending requests, and outgoing sent requests for a user
     */
    async getFriends(userId) {
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const friends = await friend_model_1.FriendModel.find({
            $or: [{ requester: userObjectId }, { recipient: userObjectId }],
            status: friend_enum_1.FriendStatus.ACCEPTED,
        })
            .populate("requester", "name email gender avatar avatarUrl")
            .populate("recipient", "name email gender avatar avatarUrl");
        // Format friends cleanly so client gets the friend's profile directly
        const formattedFriends = friends.map((f) => {
            const isRequester = f.requester._id.toString() === userId;
            const friendUser = isRequester ? f.recipient : f.requester;
            return {
                friendshipId: f._id,
                user: friendUser,
                since: f.updatedAt,
            };
        });
        // Incoming pending requests (others sent to me)
        const pendingRequests = await friend_model_1.FriendModel.find({
            recipient: userObjectId,
            status: friend_enum_1.FriendStatus.PENDING,
        }).populate("requester", "name email gender avatar avatarUrl");
        // Outgoing pending requests (I sent to others)
        const sentPendingRequests = await friend_model_1.FriendModel.find({
            requester: userObjectId,
            status: friend_enum_1.FriendStatus.PENDING,
        }).populate("recipient", "name email gender avatar avatarUrl");
        return {
            friends: formattedFriends,
            pendingRequests,
            sentPendingRequests,
        };
    }
}
exports.FriendService = FriendService;
exports.friendService = new FriendService();
