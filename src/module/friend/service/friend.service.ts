import { FriendModel } from "../../../database/model/friend.model";
import { IFriend } from "../../../common/interface/friend.interface";
import { FriendStatus } from "../../../common/enum/friend.enum";
import { User } from "../../../database/model/user.model";
import { NotFoundError } from "../../../common/response/error.response";
import { ObjectId } from "mongodb";

export class FriendService {
  public async sendFriendRequest(
    requesterId: ObjectId,
    recipientId: ObjectId,
  ): Promise<IFriend> {
    const existingRequester = await User.findOne({ _id: requesterId });
    const existingRecipient = await User.findOne({ _id: recipientId });
    if (!existingRequester || !existingRecipient) {
      throw new NotFoundError("User not found");
    }
    const friend = new FriendModel({
      requester: requesterId,
      recipient: recipientId,
      status: FriendStatus.PENDING,
    });

    await friend.save();

    return friend;
  }

  public async acceptFriendRequest(
    requesterId: ObjectId,
    recipientId: ObjectId,
  ): Promise<any> {
    const existingRequester = await User.findOne({ _id: requesterId });
    const existingRecipient = await User.findOne({ _id: recipientId });
    if (!existingRequester || !existingRecipient) {
      throw new NotFoundError("User not found");
    }
    const friend = await FriendModel.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: recipientId,
        status: FriendStatus.PENDING,
      },
      {
        $set: {
          status: FriendStatus.ACCEPTED,
        },
      },
      { new: true },
    );

    return friend;
  }

  public async rejectFriendRequest(
    requesterId: ObjectId,
    recipientId: ObjectId,
  ): Promise<any> {
    const existingRequester = await User.findOne({ _id: requesterId });
    const existingRecipient = await User.findOne({ _id: recipientId });
    if (!existingRequester || !existingRecipient) {
      throw new NotFoundError("User not found");
    }
    const friend = await FriendModel.findOneAndUpdate(
      {
        requester: requesterId,
        recipient: recipientId,
        status: FriendStatus.PENDING,
      },
      {
        $set: {
          status: FriendStatus.REJECTED,
        },
      },
      { new: true },
    );

    return friend;
  }
}
