"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const CommentSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
    },
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
}, { timestamps: true });
exports.Comment = mongoose_1.default.model("Comment", CommentSchema);
