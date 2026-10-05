import { FriendModel } from "../../../database/model/friend.model";
import { IFriend } from "../../../common/interface/friend.interface";
import { FriendStatus } from "../../../common/enum/friend.enum";
import { User } from "../../../database/model/user.model";
import { NotFoundError } from "../../../common/response/error.response";
import { ObjectId } from "mongodb";
import { DatabaseRepository } from "../../../database/repositories/database.repositorie";
import { IUser } from "../../../common/interface/user.interface";
export class FriendService {
  private userRepository: DatabaseRepository<IUser>;
  constructor() {
    this.userRepository = new DatabaseRepository(User);
  }

  public async sendFriendRequest(
    requesterId: ObjectId,
    recipientId: ObjectId,
  ): Promise<IFriend> {
    const existingRequester = await this.userRepository.findOne({
      filter: { _id: requesterId },
    });
    const existingRecipient = await this.userRepository.findOne({
      filter: { _id: recipientId },
    });
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
    const existingRequester = await this.userRepository.findOne({
      filter: { _id: requesterId },
    });
    const existingRecipient = await this.userRepository.findOne({
      filter: { _id: recipientId },
    });
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
    const existingRequester = await this.userRepository.findOne({
      filter: { _id: requesterId },
    });
    const existingRecipient = await this.userRepository.findOne({
      filter: { _id: recipientId },
    });
    if (!existingRequester || !existingRecipient) {
      throw new NotFoundError("User not found");
    }
    const friend = await this.userRepository.updateOne(
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
    );

    return friend;
  }
}
