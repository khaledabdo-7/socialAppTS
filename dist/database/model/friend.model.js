"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FriendModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const friend_enum_1 = require("../../common/enum/friend.enum");
const friendSchema = new mongoose_1.default.Schema({
    requester: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    recipient: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(friend_enum_1.FriendStatus),
        default: friend_enum_1.FriendStatus.PENDING,
    },
}, { timestamps: true });
exports.FriendModel = mongoose_1.default.model("Friend", friendSchema);
