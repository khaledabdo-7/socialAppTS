"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadService = exports.UploadService = void 0;
const cloudinary_1 = require("cloudinary");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const env_service_1 = require("../../../config/env.service");
const post_1 = require("../../../database/model/post");
const post_service_1 = require("../../post/service/post.service");
const user_service_1 = require("../../user/service/user.service");
const error_response_1 = require("../../../common/response/error.response");
// Configure Cloudinary once
cloudinary_1.v2.config({
    cloud_name: env_service_1.env.CLOUDINARY_CLOUD_NAME || "",
    api_key: env_service_1.env.CLOUDINARY_API_KEY || "",
    api_secret: env_service_1.env.CLOUDINARY_API_SECRET || "",
});
class UploadService {
    /**
     * Core helper to upload image buffer to Cloudinary CDN with resilient local storage fallback
     */
    async uploadToStorage(file, folder, prefix, req) {
        if (!file || !file.buffer) {
            throw new error_response_1.BadRequestError("No image file provided for upload");
        }
        // 1. Attempt Cloudinary upload if credentials are provided
        if (env_service_1.env.CLOUDINARY_CLOUD_NAME &&
            env_service_1.env.CLOUDINARY_API_KEY &&
            env_service_1.env.CLOUDINARY_API_SECRET) {
            try {
                const baseFolder = env_service_1.env.CLOUDINARY_FOLDER || "socialAppTS";
                const targetFolder = `${baseFolder}/${folder}`;
                const uploadResult = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary_1.v2.uploader.upload_stream({
                        folder: targetFolder,
                        resource_type: "image",
                        tags: [folder, prefix],
                    }, (error, result) => {
                        if (error)
                            return reject(error);
                        resolve(result);
                    });
                    uploadStream.end(file.buffer);
                });
                if (uploadResult?.secure_url || uploadResult?.url) {
                    const finalUrl = uploadResult.secure_url || uploadResult.url;
                    return {
                        url: finalUrl,
                        secure_url: finalUrl,
                        public_id: uploadResult.public_id,
                        storage: "cloudinary",
                    };
                }
            }
            catch (cloudErr) {
                console.warn(`[Upload:${folder}] Cloudinary upload failed, falling back to local storage:`, cloudErr?.message || cloudErr);
            }
        }
        // 2. Resilient local disk fallback
        const ext = file.mimetype.split("/")[1] || "png";
        const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
        const targetDir = path_1.default.join(process.cwd(), "uploads", folder);
        if (!fs_1.default.existsSync(targetDir)) {
            fs_1.default.mkdirSync(targetDir, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(targetDir, filename), file.buffer);
        const host = req.get("host") || `localhost:${env_service_1.env.PORT || 3007}`;
        const protocol = req.protocol || "http";
        const localUrl = `${protocol}://${host}/uploads/${folder}/${filename}`;
        return {
            url: localUrl,
            secure_url: localUrl,
            public_id: filename,
            storage: "local",
        };
    }
    /**
     * Profile Picture Upload & Server-Sided Linking
     * Logic specific to profiles:
     * - Files stored in "profiles" directory / folder
     * - Server-side direct link to User document (avatar / coverImage) in 1 call
     */
    async uploadAndLinkProfilePicture(userId, file, req, type = "avatar") {
        if (!userId) {
            throw new error_response_1.BadRequestError("User ID is required to link profile picture");
        }
        const uploadRes = await this.uploadToStorage(file, "profiles", type === "cover" ? "cover" : "avatar", req);
        // Update user profile in database (server-sided link)
        const updatedUser = await user_service_1.userService.updateProfilePicture(userId, uploadRes.url, type);
        return {
            url: uploadRes.url,
            secure_url: uploadRes.secure_url,
            user: updatedUser,
            type,
        };
    }
    /**
     * Post Picture Upload & Server-Sided Linking
     * Logic specific to posts:
     * - Files stored in "posts" directory / folder
     * - Server-side direct link to Post:
     *   - Updates existing post if postId is given
     *   - Creates new post if post content (title & content) is given
     *   - Or returns post image URL
     */
    async uploadAndLinkPostPicture(userId, file, req, options = {}) {
        const uploadRes = await this.uploadToStorage(file, "posts", "post", req);
        // Case 1: Link to existing post
        if (options.postId) {
            const post = await post_1.Post.findById(options.postId);
            if (!post) {
                throw new error_response_1.NotFoundError("Post not found");
            }
            if (post.ownerId && post.ownerId.toString() !== userId) {
                throw new error_response_1.ForbiddenError("You are not authorized to update this post's picture");
            }
            post.imageUrl = uploadRes.url;
            await post.save();
            const populatedPost = await post.populate("ownerId", "name gender role avatar avatarUrl bio");
            return {
                url: uploadRes.url,
                secure_url: uploadRes.secure_url,
                post: populatedPost,
            };
        }
        // Case 2: Create new post with image in ONE call
        if (options.postData?.title && options.postData?.content) {
            let tags = [];
            if (typeof options.postData.tags === "string") {
                try {
                    tags = JSON.parse(options.postData.tags);
                }
                catch {
                    tags = options.postData.tags
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean);
                }
            }
            else if (Array.isArray(options.postData.tags)) {
                tags = options.postData.tags;
            }
            const allowComments = options.postData.allowComments === undefined
                ? true
                : String(options.postData.allowComments) !== "false";
            const createdPost = await post_service_1.postService.createPost({
                title: options.postData.title,
                content: options.postData.content,
                imageUrl: uploadRes.url,
                tags,
                allowComments,
                ownerId: userId,
            });
            return {
                url: uploadRes.url,
                secure_url: uploadRes.secure_url,
                post: createdPost,
            };
        }
        // Case 3: Return uploaded post image result
        return {
            url: uploadRes.url,
            secure_url: uploadRes.secure_url,
        };
    }
}
exports.UploadService = UploadService;
exports.uploadService = new UploadService();
