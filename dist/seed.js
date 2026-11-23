"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = require("./database/model/user.model");
const post_1 = require("./database/model/post");
const comment_model_1 = require("./database/model/comment.model");
const friend_model_1 = require("./database/model/friend.model");
const env_service_1 = require("./config/env.service");
const reacts_enum_1 = require("./common/enum/reacts.enum");
const friend_enum_1 = require("./common/enum/friend.enum");
async function seed() {
    console.log("Connecting to MongoDB Atlas...");
    const mongoUri = env_service_1.env.mongoURL || process.env.MONGO_URI || "";
    await mongoose_1.default.connect(mongoUri);
    console.log("Connected to MongoDB!");
    // Drop obsolete id_1 unique index from collections if they exist in MongoDB Atlas
    for (const model of [user_model_1.User, post_1.Post, comment_model_1.Comment, friend_model_1.FriendModel]) {
        try {
            await model.collection.dropIndex("id_1");
            console.log(`Dropped legacy id_1 index from ${model.collection.name}`);
        }
        catch (e) {
            // index doesn't exist or already dropped
        }
    }
    // Clean old test seed users if exist
    const emails = [
        "khaled@sphere.io",
        "omar@sphere.io",
        "sarah@sphere.io",
        "nourhan@sphere.io",
        "mahmoud@sphere.io",
    ];
    const existingUsers = await user_model_1.User.find({ email: { $in: emails } });
    const existingIds = existingUsers.map((u) => u._id);
    await post_1.Post.deleteMany({ ownerId: { $in: existingIds } });
    await comment_model_1.Comment.deleteMany({ ownerId: { $in: existingIds } });
    await friend_model_1.FriendModel.deleteMany({
        $or: [
            { requester: { $in: existingIds } },
            { recipient: { $in: existingIds } },
        ],
    });
    await user_model_1.User.deleteMany({ email: { $in: emails } });
    const hashedPassword = await bcrypt_1.default.hash("Password123!", 10);
    console.log("Creating seed users...");
    const users = await user_model_1.User.insertMany([
        {
            name: "Khaled Abdo",
            email: "khaled@sphere.io",
            password: hashedPassword,
            gender: "male",
            role: "admin",
            isVerified: true,
            bio: "Full-Stack Software Engineer & Distributed Systems Enthusiast. Creator of Sphere 🚀",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
            coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        },
        {
            name: "Omar Tarek",
            email: "omar@sphere.io",
            password: hashedPassword,
            gender: "male",
            role: "user",
            isVerified: true,
            bio: "Cloud & Realtime Systems Specialist | Node.js, Redis, and WebSockets Architect",
            avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80",
            coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80",
        },
        {
            name: "Sarah Ahmed",
            email: "sarah@sphere.io",
            password: hashedPassword,
            gender: "female",
            role: "user",
            isVerified: true,
            bio: "Lead UI/UX Product Designer & Design Systems advocate. Turning complex ideas into intuitive interfaces.",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
            coverImage: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1200&auto=format&fit=crop&q=80",
        },
        {
            name: "Nourhan Mahmoud",
            email: "nourhan@sphere.io",
            password: hashedPassword,
            gender: "female",
            role: "user",
            isVerified: true,
            bio: "TypeScript & React fanatic. Passionate about web performance, animations, and clean architecture.",
            avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
            coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80",
        },
        {
            name: "Mahmoud Ali",
            email: "mahmoud@sphere.io",
            password: hashedPassword,
            gender: "male",
            role: "user",
            isVerified: true,
            bio: "DevOps & Containerization geek. Automating all the things with Docker and CI/CD pipelines.",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
            coverImage: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&auto=format&fit=crop&q=80",
        },
    ]);
    const khaled = users[0];
    const omar = users[1];
    const sarah = users[2];
    const nourhan = users[3];
    const mahmoud = users[4];
    console.log("Creating friendships...");
    await friend_model_1.FriendModel.insertMany([
        {
            requester: omar._id,
            recipient: khaled._id,
            status: friend_enum_1.FriendStatus.ACCEPTED,
        },
        {
            requester: sarah._id,
            recipient: khaled._id,
            status: friend_enum_1.FriendStatus.ACCEPTED,
        },
        {
            requester: nourhan._id,
            recipient: khaled._id,
            status: friend_enum_1.FriendStatus.ACCEPTED,
        },
        {
            requester: mahmoud._id,
            recipient: khaled._id,
            status: friend_enum_1.FriendStatus.PENDING,
        },
    ]);
    console.log("Creating seed posts...");
    const post1 = new post_1.Post({
        title: "Building Sphere v2.0: High-Throughput WebSockets with Redis Pub/Sub",
        content: "Extremely excited to share our latest architecture! We separated message persistence into an atomic MongoDB write pipeline and combined it with an in-memory Redis layer for instant Socket.IO fanout.\n\nLatency dropped to sub-15ms for direct messages! Check out the clean theme and custom vector reactions.",
        ownerId: khaled._id,
        allowComments: true,
        imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80",
        reaction: [
            { userId: omar._id, type: reacts_enum_1.ReactType.LIKE },
            { userId: sarah._id, type: reacts_enum_1.ReactType.LOVE },
            { userId: nourhan._id, type: reacts_enum_1.ReactType.WOW },
        ],
    });
    await post1.save();
    const post2 = new post_1.Post({
        title: "Crafting a Tactile Dual Theme System: Slate Navy & Earthy Charcoal",
        content: "Design update: We ditched harsh white and pure black in favor of two deeply comfortable palettes:\n• Light: Crisp Navy + Soft Slate Cloud (#F9F7F7, #DBE2EF, #3F72AF, #112D4E)\n• Dark: Warm Almond & Charcoal (#222831, #393E46, #948979, #DFD0B8)\n\nBoth themes maintain WCAG AAA contrast ratios across all cards and text elements.",
        ownerId: sarah._id,
        allowComments: true,
        imageUrl: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=900&auto=format&fit=crop&q=80",
        reaction: [
            { userId: khaled._id, type: reacts_enum_1.ReactType.LOVE },
            { userId: nourhan._id, type: reacts_enum_1.ReactType.LIKE },
            { userId: mahmoud._id, type: reacts_enum_1.ReactType.WOW },
        ],
    });
    await post2.save();
    const post3 = new post_1.Post({
        title: "Why Minimalist Vector Badges Win Over Generic Device Emojis",
        content: "Ever notice how native yellow device emojis look completely different between iOS, Android, and Windows? By replacing them with bespoke vector icons (Spark, Love, Insight, Support, Celebrate), the UI feels 10x more polished, intentional, and high-end.",
        ownerId: omar._id,
        allowComments: true,
        reaction: [
            { userId: khaled._id, type: reacts_enum_1.ReactType.LIKE },
            { userId: sarah._id, type: reacts_enum_1.ReactType.LIKE },
        ],
    });
    await post3.save();
    console.log("Adding comments to posts...");
    const comment1 = new comment_model_1.Comment({
        content: "The WebSocket latency improvement is truly remarkable! Great work on this release.",
        ownerId: omar._id,
        postId: post1._id,
    });
    await comment1.save();
    const comment2 = new comment_model_1.Comment({
        content: "The contrast between the navy and soft cloud background is so comfortable on the eyes!",
        ownerId: nourhan._id,
        postId: post2._id,
    });
    await comment2.save();
    post1.comments = [comment1._id];
    await post1.save();
    post2.comments = [comment2._id];
    await post2.save();
    console.log("Seed completed successfully!");
    console.log("-----------------------------------------");
    console.log("Test Login Credentials (All users have password: Password123!):");
    console.log("1. Khaled (Admin): khaled@sphere.io");
    console.log("2. Omar: omar@sphere.io");
    console.log("3. Sarah: sarah@sphere.io");
    console.log("4. Nourhan: nourhan@sphere.io");
    console.log("5. Mahmoud: mahmoud@sphere.io");
    console.log("-----------------------------------------");
    process.exit(0);
}
seed().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
