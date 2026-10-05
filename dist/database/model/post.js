"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const reacts_enum_1 = require("../../common/enum/reacts.enum");
const PostSchema = new mongoose_1.default.Schema({
    title: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    ownerId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
    },
    tags: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "User",
    },
    allowComments: {
        type: Boolean,
        default: true,
    },
    comments: {
        type: [mongoose_1.default.Schema.Types.ObjectId],
        ref: "Comment",
    },
    imageUrl: {
        type: String,
    },
    reaction: [
        {
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            type: {
                type: String,
                enum: Object.values(reacts_enum_1.ReactType),
            },
        },
    ],
}, { timestamps: true });
exports.Post = mongoose_1.default.model("Post", PostSchema);
