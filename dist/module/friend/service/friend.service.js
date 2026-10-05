"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendService = void 0;
const friend_model_1 = require("../../../database/model/friend.model");
const friend_enum_1 = require("../../../common/enum/friend.enum");
const user_model_1 = require("../../../database/model/user.model");
const error_response_1 = require("../../../common/response/error.response");
const database_repositorie_1 = require("../../../database/repositories/database.repositorie");
class FriendService {
    userRepository;
    constructor() {
        this.userRepository = new database_repositorie_1.DatabaseRepository(user_model_1.User);
    }
    async sendFriendRequest(requesterId, recipientId) {
        const existingRequester = await this.userRepository.findOne({
            filter: { _id: requesterId },
        });
        const existingRecipient = await this.userRepository.findOne({
            filter: { _id: recipientId },
        });
        if (!existingRequester || !existingRecipient) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const friend = new friend_model_1.FriendModel({
            requester: requesterId,
            recipient: recipientId,
            status: friend_enum_1.FriendStatus.PENDING,
        });
        await friend.save();
        return friend;
    }
    async acceptFriendRequest(requesterId, recipientId) {
        const existingRequester = await this.userRepository.findOne({
            filter: { _id: requesterId },
        });
        const existingRecipient = await this.userRepository.findOne({
            filter: { _id: recipientId },
        });
        if (!existingRequester || !existingRecipient) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const friend = await friend_model_1.FriendModel.findOneAndUpdate({
            requester: requesterId,
            recipient: recipientId,
            status: friend_enum_1.FriendStatus.PENDING,
        }, {
            $set: {
                status: friend_enum_1.FriendStatus.ACCEPTED,
            },
        }, { new: true });
        return friend;
    }
    async rejectFriendRequest(requesterId, recipientId) {
        const existingRequester = await this.userRepository.findOne({
            filter: { _id: requesterId },
        });
        const existingRecipient = await this.userRepository.findOne({
            filter: { _id: recipientId },
        });
        if (!existingRequester || !existingRecipient) {
            throw new error_response_1.NotFoundError("User not found");
        }
        const friend = await this.userRepository.updateOne({
            requester: requesterId,
            recipient: recipientId,
            status: friend_enum_1.FriendStatus.PENDING,
        }, {
            $set: {
                status: friend_enum_1.FriendStatus.REJECTED,
            },
        });
        return friend;
    }
}
exports.FriendService = FriendService;
