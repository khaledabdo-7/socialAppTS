"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const chat_service_1 = require("./chat.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_response_1 = require("../../common/response/success.response");
const chatRouter = (0, express_1.default)();
/**
 * GET /chat/history/:friendId
 * Get conversation history with a friend
 */
chatRouter.get("/history/:friendId", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const friendId = req.params.friendId;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const history = await chat_service_1.chatService.getChatHistory(userId, friendId, page, limit);
        return (0, success_response_1.successResponse)(res, history, "Chat history retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /chat/conversations
 * Get recent conversations list
 */
chatRouter.get("/conversations", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const conversations = await chat_service_1.chatService.getRecentConversations(userId);
        return (0, success_response_1.successResponse)(res, conversations, "Conversations list retrieved", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * PATCH /chat/read/:friendId
 * Mark incoming messages from friend as read
 */
chatRouter.patch("/read/:friendId", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const friendId = req.params.friendId;
        await chat_service_1.chatService.markMessagesAsRead(userId, friendId);
        return (0, success_response_1.successResponse)(res, null, "Messages marked as read", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = chatRouter;
