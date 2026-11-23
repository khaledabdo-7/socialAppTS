"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bootstrap = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const helmet_1 = __importDefault(require("helmet"));
const env_service_1 = require("./config/env.service");
const mongo_connection_1 = require("./database/mongo.connection");
const globalErrorHandler_middleware_1 = require("./middleware/globalErrorHandler.middleware");
const auth_controller_1 = __importDefault(require("./module/auth/auth.controller"));
const redis_connection_1 = require("./database/redis.connection");
const rateLimit_middleware_1 = __importDefault(require("./middleware/rateLimit.middleware"));
const post_controller_1 = __importDefault(require("./module/post/post.controller"));
const comment_controller_1 = __importDefault(require("./module/comment/comment.controller"));
const user_controller_1 = __importDefault(require("./module/user/user.controller"));
const friend_controller_1 = __importDefault(require("./module/friend/friend.controller"));
const chat_controller_1 = __importDefault(require("./module/chat/chat.controller"));
const notification_controller_1 = __importDefault(require("./module/notification/notification.controller"));
const upload_controller_1 = __importDefault(require("./module/upload/upload.controller"));
const express_2 = require("graphql-http/lib/use/express");
const schema_gql_1 = require("./module/gql/schema.gql");
const realtime_gateway_1 = require("./module/realtime/realtime.gateway");
const bootstrap = async () => {
    const app = (0, express_1.default)();
    const port = env_service_1.env.PORT;
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: true,
        credentials: true,
    }));
    const limiter = (0, rateLimit_middleware_1.default)(15 * 60 * 1000, 1000);
    app.use(limiter);
    app.use((0, helmet_1.default)({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
    await (0, mongo_connection_1.connectDB)();
    await (0, redis_connection_1.redisConnection)();
    // Serve static uploads with subdirectories
    const uploadsDir = path_1.default.join(process.cwd(), "uploads");
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
    for (const sub of ["profiles", "posts", "general"]) {
        const subPath = path_1.default.join(uploadsDir, sub);
        if (!fs_1.default.existsSync(subPath)) {
            fs_1.default.mkdirSync(subPath, { recursive: true });
        }
    }
    app.use("/uploads", express_1.default.static(uploadsDir));
    app.all("/graphql", (0, express_2.createHandler)({ schema: schema_gql_1.schema, context: (req) => ({ req }) }));
    app.use("/auth", auth_controller_1.default);
    app.use("/post", post_controller_1.default);
    app.use("/comment", comment_controller_1.default);
    app.use("/user", user_controller_1.default);
    app.use("/friend", friend_controller_1.default);
    app.use("/chat", chat_controller_1.default);
    app.use("/notification", notification_controller_1.default);
    app.use("/upload", upload_controller_1.default);
    app.use(globalErrorHandler_middleware_1.globalErrorHandler);
    const httpServer = app.listen(port, () => {
        console.log(`Server is running in port ${port}`);
    });
    realtime_gateway_1.realtimeGateway.initializer(httpServer);
};
exports.bootstrap = bootstrap;
