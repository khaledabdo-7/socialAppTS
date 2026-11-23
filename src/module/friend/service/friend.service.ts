import { FriendModel } from "../../../database/model/friend.model";
import { IFriend } from "../../../common/interface/friend.interface";
import { FriendStatus } from "../../../common/enum/friend.enum";
import { User } from "../../../database/model/user.model";
import {
  NotFoundError,
  BadRequestError,
} from "../../../common/response/error.response";
import { notificationService } from "../../notification/notification.service";
import { NotificationType } from "../../../database/model/notification.model";
import { Types } from "mongoose";

export class FriendService {
  /**
   * Send friend request with self-check & state verification
   */
  public async sendFriendRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<IFriend> {
    if (!recipientId || !Types.ObjectId.isValid(recipientId)) {
      throw new BadRequestError("Valid recipientId is required");
    }

    if (requesterId.toString() === recipientId.toString()) {
      throw new BadRequestError("You cannot send a friend request to yourself");
    }

    const existingRequester = await User.findById(requesterId);
    const existingRecipient = await User.findById(recipientId);

    if (!existingRequester || !existingRecipient) {
      throw new NotFoundError("User not found");
    }

    const existingFriend = await FriendModel.findOne({
      $or: [
        { requester: requesterId, recipient: recipientId },
        { requester: recipientId, recipient: requesterId },
      ],
    });

    if (existingFriend) {
      if (existingFriend.status === FriendStatus.ACCEPTED) {
        throw new BadRequestError("You are already friends");
      }
      if (existingFriend.status === FriendStatus.PENDING) {
        throw new BadRequestError("A friend request is already pending");
      }

      // If previously rejected, reopen the request
      existingFriend.requester = new Types.ObjectId(requesterId) as any;
      existingFriend.recipient = new Types.ObjectId(recipientId) as any;
      existingFriend.status = FriendStatus.PENDING;
      await existingFriend.save();
      return existingFriend;
    }

    const friend = new FriendModel({
      requester: new Types.ObjectId(requesterId),
      recipient: new Types.ObjectId(recipientId),
      status: FriendStatus.PENDING,
    });

    await friend.save();

    // Trigger notification to recipient
    await notificationService.createNotification({
      recipient: recipientId,
      sender: requesterId,
      type: NotificationType.FRIEND_REQUEST,
      message: `${existingRequester.name} sent you a friend request`,
    });

    return friend;
  }

  /**
   * Accept friend request
   */
  public async acceptFriendRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<any> {
    const friend = await FriendModel.findOneAndUpdate(
      {
        requester: new Types.ObjectId(requesterId),
        recipient: new Types.ObjectId(recipientId),
        status: FriendStatus.PENDING,
      },
      {
        $set: {
          status: FriendStatus.ACCEPTED,
        },
      },
      { new: true },
    );

    if (!friend) {
      throw new NotFoundError("Friend request not found or already handled");
    }

    const recipientUser = await User.findById(recipientId);
    await notificationService.createNotification({
      recipient: requesterId,
      sender: recipientId,
      type: NotificationType.FRIEND_ACCEPT,
      message: `${recipientUser?.name || "A user"} accepted your friend request`,
    });

    return friend;
  }

  /**
   * Reject friend request
   */
  public async rejectFriendRequest(
    requesterId: string,
    recipientId: string,
  ): Promise<any> {
    const friend = await FriendModel.findOneAndUpdate(
      {
        requester: new Types.ObjectId(requesterId),
        recipient: new Types.ObjectId(recipientId),
        status: FriendStatus.PENDING,
      },
      {
        $set: {
          status: FriendStatus.REJECTED,
        },
      },
      { new: true },
    );

    if (!friend) {
      throw new NotFoundError("Friend request not found or already handled");
    }

    const recipientUser = await User.findById(recipientId);
    await notificationService.createNotification({
      recipient: requesterId,
      sender: recipientId,
      type: NotificationType.FRIEND_ACCEPT,
      message: `${recipientUser?.name || "A user"} accepted your friend request`,
    });

    return friend;
  }

  /**
   * Unfriend or cancel request
   */
  public async unfriend(userId: string, friendId: string): Promise<void> {
    const userObjId = new Types.ObjectId(userId);
    const friendObjId = new Types.ObjectId(friendId);

    const result = await FriendModel.findOneAndDelete({
      $or: [
        { requester: userObjId, recipient: friendObjId },
        { requester: friendObjId, recipient: userObjId },
      ],
    });

    if (!result) {
      throw new NotFoundError("Friendship relation not found");
    }
  }

  /**
   * Get all accepted friends, incoming pending requests, and outgoing sent requests for a user
   */
  public async getFriends(userId: string): Promise<any> {
    const userObjectId = new Types.ObjectId(userId);
    const friends = await FriendModel.find({
      $or: [{ requester: userObjectId }, { recipient: userObjectId }],
      status: FriendStatus.ACCEPTED,
    })
      .populate("requester", "name email gender avatar avatarUrl")
      .populate("recipient", "name email gender avatar avatarUrl");

    // Format friends cleanly so client gets the friend's profile directly
    const formattedFriends = friends.map((f: any) => {
      const isRequester = f.requester._id.toString() === userId;
      const friendUser = isRequester ? f.recipient : f.requester;
      return {
        friendshipId: f._id,
        user: friendUser,
        since: f.updatedAt,
      };
    });

    // Incoming pending requests (others sent to me)
    const pendingRequests = await FriendModel.find({
      recipient: userObjectId,
      status: FriendStatus.PENDING,
    }).populate("requester", "name email gender avatar avatarUrl");

    // Outgoing pending requests (I sent to others)
    const sentPendingRequests = await FriendModel.find({
      requester: userObjectId,
      status: FriendStatus.PENDING,
    }).populate("recipient", "name email gender avatar avatarUrl");

    return {
      friends: formattedFriends,
      pendingRequests,
      sentPendingRequests,
    };
  }
}

export const friendService = new FriendService();
