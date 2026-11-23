import { User } from "../../../database/model/user.model";
import { FriendModel } from "../../../database/model/friend.model";
import { FriendStatus } from "../../../common/enum/friend.enum";
import { IUser } from "../../../common/interface/user.interface";
import {
  NotFoundError,
  BadRequestError,
} from "../../../common/response/error.response";
import { Types } from "mongoose";

export class UserService {
  /**
   * Get user profile by ID with friendship status relative to current user
   */
  async getUserById(id: string, currentUserId?: string): Promise<any> {
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestError("Invalid user ID");
    }

    const user = await User.findById(id).select("-password -otp");
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const userObj = user.toObject();
    const finalAvatar = userObj.avatar || userObj.avatarUrl || "";
    userObj.avatar = finalAvatar;
    userObj.avatarUrl = finalAvatar;

    let friendshipStatus = "NONE";
    if (currentUserId && currentUserId !== id) {
      const friendDoc = await FriendModel.findOne({
        $or: [
          { requester: currentUserId, recipient: id },
          { requester: id, recipient: currentUserId },
        ],
      });

      if (friendDoc) {
        if (friendDoc.status === FriendStatus.ACCEPTED) {
          friendshipStatus = "FRIEND";
        } else if (friendDoc.status === FriendStatus.PENDING) {
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
  async searchUsers(
    query: string,
    currentUserId: string,
    limit: number = 20,
  ): Promise<any[]> {
    if (!query || !query.trim()) {
      return [];
    }

    const cleanQuery = query.trim();
    const regex = new RegExp(cleanQuery, "i");

    const users = await User.find({
      _id: { $ne: new Types.ObjectId(currentUserId) },
      $or: [{ name: regex }, { email: regex }],
    })
      .select("name email gender avatar avatarUrl bio role")
      .limit(limit);

    // Attach friendship status for each user in result
    const results = await Promise.all(
      users.map(async (u) => {
        const friendDoc = await FriendModel.findOne({
          $or: [
            { requester: currentUserId, recipient: u._id },
            { requester: u._id, recipient: currentUserId },
          ],
        });

        let friendshipStatus = "NONE";
        if (friendDoc) {
          if (friendDoc.status === FriendStatus.ACCEPTED) {
            friendshipStatus = "FRIEND";
          } else if (friendDoc.status === FriendStatus.PENDING) {
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
      }),
    );

    return results;
  }

  /**
   * Get friend suggestions (registered users who are not yet friends)
   */
  async getSuggestions(currentUserId: string, limit: number = 8): Promise<any[]> {
    const userObjId = new Types.ObjectId(currentUserId);

    // Get all users involved in any friend relation with current user
    const existingRelations = await FriendModel.find({
      $or: [{ requester: userObjId }, { recipient: userObjId }],
    });

    const excludedIds = existingRelations.map((r) =>
      r.requester.toString() === currentUserId ? r.recipient : r.requester,
    );
    excludedIds.push(userObjId);

    const suggestions = await User.find({
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
  async updateProfile(id: string, updateData: Partial<IUser>): Promise<any> {
    // Whitelist only editable profile fields
    const allowedUpdates: Partial<IUser> = {};
    if (updateData.name) allowedUpdates.name = updateData.name;
    if (updateData.bio !== undefined) allowedUpdates.bio = updateData.bio;
    if (updateData.avatar !== undefined) {
      allowedUpdates.avatar = updateData.avatar;
      allowedUpdates.avatarUrl = updateData.avatar;
    }
    if (updateData.avatarUrl !== undefined) {
      allowedUpdates.avatar = updateData.avatarUrl;
      allowedUpdates.avatarUrl = updateData.avatarUrl;
    }
    if (updateData.coverImage !== undefined) allowedUpdates.coverImage = updateData.coverImage;
    if (updateData.gender) allowedUpdates.gender = updateData.gender;
    if (updateData.isPrivate !== undefined) allowedUpdates.isPrivate = updateData.isPrivate;

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true },
    ).select("-password -otp");

    if (!updated) {
      throw new NotFoundError("User not found");
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
  async updateProfilePicture(
    id: string,
    imageUrl: string,
    type: "avatar" | "cover" = "avatar",
  ): Promise<any> {
    const updateObj: any = {};
    if (type === "cover") {
      updateObj.coverImage = imageUrl;
    } else {
      updateObj.avatar = imageUrl;
      updateObj.avatarUrl = imageUrl;
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { $set: updateObj },
      { new: true },
    ).select("-password -otp");

    if (!updated) {
      throw new NotFoundError("User not found");
    }

    const upObj = updated.toObject();
    const av = upObj.avatar || upObj.avatarUrl || "";
    upObj.avatar = av;
    upObj.avatarUrl = av;
    return upObj;
  }
}

export const userService = new UserService();
