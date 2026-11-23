"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = exports.UserService = void 0;
const user_model_1 = require("../../../database/model/user.model");
const friend_model_1 = require("../../../database/model/friend.model");
const friend_enum_1 = require("../../../common/enum/friend.enum");
const error_response_1 = require("../../../common/response/error.response");
const mongoose_1 = require("mongoose");
class UserService {
    /**
     * Get user profile by ID with friendship status relative to current user
     */
    async getUserById(id, currentUserId) {
        if (!id || !mongoose_1.Types.ObjectId.isValid(id)) {
            throw new error_response_1.BadRequestError("Invalid user ID");
        }
        const user = await user_model_1.User.findById(id).select("-password -otp");
        if (!user) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const userObj = user.toObject();
        const finalAvatar = userObj.avatar || userObj.avatarUrl || "";
        userObj.avatar = finalAvatar;
        userObj.avatarUrl = finalAvatar;
        let friendshipStatus = "NONE";
        if (currentUserId && currentUserId !== id) {
            const friendDoc = await friend_model_1.FriendModel.findOne({
                $or: [
                    { requester: currentUserId, recipient: id },
                    { requester: id, recipient: currentUserId },
                ],
            });
            if (friendDoc) {
                if (friendDoc.status === friend_enum_1.FriendStatus.ACCEPTED) {
                    friendshipStatus = "FRIEND";
                }
                else if (friendDoc.status === friend_enum_1.FriendStatus.PENDING) {
                    friendshipStatus =
                        friendDoc.requester.toString() === currentUserId
                            ? "PENDING_SENT"
                            : "PENDING_RECEIVED";
                }
            }
        }
        return {
            ...userObj,
            friendshipStatus,
        };
    }
    /**
     * Search users by name or email with friendship status
     */
    async searchUsers(query, currentUserId, limit = 20) {
        if (!query || !query.trim()) {
            return [];
        }
        const cleanQuery = query.trim();
        const regex = new RegExp(cleanQuery, "i");
        const users = await user_model_1.User.find({
            _id: { $ne: new mongoose_1.Types.ObjectId(currentUserId) },
            $or: [{ name: regex }, { email: regex }],
        })
            .select("name email gender avatar avatarUrl bio role")
            .limit(limit);
        // Attach friendship status for each user in result
        const results = await Promise.all(users.map(async (u) => {
            const friendDoc = await friend_model_1.FriendModel.findOne({
                $or: [
                    { requester: currentUserId, recipient: u._id },
                    { requester: u._id, recipient: currentUserId },
                ],
            });
            let friendshipStatus = "NONE";
            if (friendDoc) {
                if (friendDoc.status === friend_enum_1.FriendStatus.ACCEPTED) {
                    friendshipStatus = "FRIEND";
                }
                else if (friendDoc.status === friend_enum_1.FriendStatus.PENDING) {
                    friendshipStatus =
                        friendDoc.requester.toString() === currentUserId
                            ? "PENDING_SENT"
                            : "PENDING_RECEIVED";
                }
            }
            const uObj = u.toObject();
            const av = uObj.avatar || uObj.avatarUrl || "";
            uObj.avatar = av;
            uObj.avatarUrl = av;
            return {
                ...uObj,
                friendshipStatus,
            };
        }));
        return results;
    }
    /**
     * Get friend suggestions (registered users who are not yet friends)
     */
    async getSuggestions(currentUserId, limit = 8) {
        const userObjId = new mongoose_1.Types.ObjectId(currentUserId);
        // Get all users involved in any friend relation with current user
        const existingRelations = await friend_model_1.FriendModel.find({
            $or: [{ requester: userObjId }, { recipient: userObjId }],
        });
        const excludedIds = existingRelations.map((r) => r.requester.toString() === currentUserId ? r.recipient : r.requester);
        excludedIds.push(userObjId);
        const suggestions = await user_model_1.User.find({
            _id: { $nin: excludedIds },
            isDeactivated: false,
        })
            .select("name email gender avatar avatarUrl bio")
            .sort({ createdAt: -1 })
            .limit(limit);
        return suggestions.map((s) => {
            const sObj = s.toObject();
            const av = sObj.avatar || sObj.avatarUrl || "";
            sObj.avatar = av;
            sObj.avatarUrl = av;
            return sObj;
        });
    }
    /**
     * Update current user profile
     */
    async updateProfile(id, updateData) {
        // Whitelist only editable profile fields
        const allowedUpdates = {};
        if (updateData.name)
            allowedUpdates.name = updateData.name;
        if (updateData.bio !== undefined)
            allowedUpdates.bio = updateData.bio;
        if (updateData.avatar !== undefined) {
            allowedUpdates.avatar = updateData.avatar;
            allowedUpdates.avatarUrl = updateData.avatar;
        }
        if (updateData.avatarUrl !== undefined) {
            allowedUpdates.avatar = updateData.avatarUrl;
            allowedUpdates.avatarUrl = updateData.avatarUrl;
        }
        if (updateData.coverImage !== undefined)
            allowedUpdates.coverImage = updateData.coverImage;
        if (updateData.gender)
            allowedUpdates.gender = updateData.gender;
        if (updateData.isPrivate !== undefined)
            allowedUpdates.isPrivate = updateData.isPrivate;
        const updated = await user_model_1.User.findByIdAndUpdate(id, { $set: allowedUpdates }, { new: true }).select("-password -otp");
        if (!updated) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const upObj = updated.toObject();
        const av = upObj.avatar || upObj.avatarUrl || "";
        upObj.avatar = av;
        upObj.avatarUrl = av;
        return upObj;
    }
    /**
     * Update profile picture (avatar or cover) and link directly
     */
    async updateProfilePicture(id, imageUrl, type = "avatar") {
        const updateObj = {};
        if (type === "cover") {
            updateObj.coverImage = imageUrl;
        }
        else {
            updateObj.avatar = imageUrl;
            updateObj.avatarUrl = imageUrl;
        }
        const updated = await user_model_1.User.findByIdAndUpdate(id, { $set: updateObj }, { new: true }).select("-password -otp");
        if (!updated) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const upObj = updated.toObject();
        const av = upObj.avatar || upObj.avatarUrl || "";
        upObj.avatar = av;
        upObj.avatarUrl = av;
        return upObj;
    }
}
exports.UserService = UserService;
exports.userService = new UserService();
