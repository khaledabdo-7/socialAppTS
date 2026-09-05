"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reacts_enum_1 = require("../../common/enum/reacts.enum");
const CommentSchema = new mongoose_1.default.Schema({
    content: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    postId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Post",
    },
    mentions: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "User",
    },
    imageUrl: {
        type: [String],
    },
    reactions: {
        type: String,
        enum: Object.values(reacts_enum_1.ReactType),
    },
    replies: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Comment",
    },
}, { timestamps: true });
exports.Comment = mongoose_1.default.model("Comment", CommentSchema);
