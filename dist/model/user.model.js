"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_enum_1 = require("../common/enum/user.enum");
const UserSchema = new mongoose_1.default.Schema({
    id: {
        type: String,
        required: false,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    confirmPassword: {
        type: String,
        required: false,
    },
    otp: {
        type: String,
    },
    role: {
        type: String,
        default: user_enum_1.UserRole.USER,
        enum: [user_enum_1.UserRole.ADMIN, user_enum_1.UserRole.USER],
    },
    gender: {
        type: String,
        default: user_enum_1.UserGender.MALE,
        enum: [user_enum_1.UserGender.MALE, user_enum_1.UserGender.FEMALE],
    },
    provider: {
        type: String,
        default: user_enum_1.ProviderType.SYSTEM,
        enum: [user_enum_1.ProviderType.GOOGLE, user_enum_1.ProviderType.FACEBOOK, user_enum_1.ProviderType.SYSTEM],
    },
    isDeactivated: {
        type: Boolean,
        default: false,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    isPrivate: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.User = mongoose_1.default.model("User", UserSchema);
