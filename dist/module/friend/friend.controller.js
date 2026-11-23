"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const friend_service_1 = require("./service/friend.service");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const success_response_1 = require("../../common/response/success.response");
const friendRouter = (0, express_1.default)();
/**
 * POST /friend/send
 * Send a friend request
 */
friendRouter.post("/send", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const requesterId = req.user?.id;
        const { recipientId } = req.body;
        const result = await friend_service_1.friendService.sendFriendRequest(requesterId, recipientId);
        return (0, success_response_1.successResponse)(res, result, "Friend request sent", 201);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /friend/accept
 * Accept a friend request
 */
friendRouter.post("/accept", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const recipientId = req.user?.id;
        const { requesterId } = req.body;
        const result = await friend_service_1.friendService.acceptFriendRequest(requesterId, recipientId);
        return (0, success_response_1.successResponse)(res, result, "Friend request accepted", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /friend/reject
 * Reject a friend request
 */
friendRouter.post("/reject", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const recipientId = req.user?.id;
        const { requesterId } = req.body;
        const result = await friend_service_1.friendService.rejectFriendRequest(requesterId, recipientId);
        return (0, success_response_1.successResponse)(res, result, "Friend request rejected", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /friend/unfriend/:friendId
 * Unfriend or cancel friend request
 */
friendRouter.delete("/unfriend/:friendId", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const friendId = req.params.friendId;
        await friend_service_1.friendService.unfriend(userId, friendId);
        return (0, success_response_1.successResponse)(res, null, "Friend removed successfully", 200);
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /friend/list
 * Get accepted friends and pending requests
 */
friendRouter.get("/list", (0, auth_middleware_1.authMiddleware)(), async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const result = await friend_service_1.friendService.getFriends(userId);
        return (0, success_response_1.successResponse)(res, result, "Friends list fetched", 200);
    }
    catch (error) {
        next(error);
    }
});
exports.default = friendRouter;
