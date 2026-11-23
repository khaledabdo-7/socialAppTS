import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";
import { Request } from "express";
import { env } from "../../../config/env.service";
import { User } from "../../../database/model/user.model";
import { Post } from "../../../database/model/post";
import { postService } from "../../post/service/post.service";
import { userService } from "../../user/service/user.service";
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
} from "../../../common/response/error.response";
import { IPost } from "../../../common/interface/post.interface";

// Configure Cloudinary once
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || "",
  api_key: env.CLOUDINARY_API_KEY || "",
  api_secret: env.CLOUDINARY_API_SECRET || "",
});

export interface UploadResult {
  url: string;
  secure_url: string;
  public_id?: string;
  storage: "cloudinary" | "local";
}

export class UploadService {
  /**
   * Core helper to upload image buffer to Cloudinary CDN with resilient local storage fallback
   */
  public async uploadToStorage(
    file: Express.Multer.File,
    folder: "profiles" | "posts" | "general",
    prefix: string,
    req: Request,
  ): Promise<UploadResult> {
    if (!file || !file.buffer) {
      throw new BadRequestError("No image file provided for upload");
    }

    // 1. Attempt Cloudinary upload if credentials are provided
    if (
      env.CLOUDINARY_CLOUD_NAME &&
      env.CLOUDINARY_API_KEY &&
      env.CLOUDINARY_API_SECRET
    ) {
      try {
        const baseFolder = env.CLOUDINARY_FOLDER || "socialAppTS";
        const targetFolder = `${baseFolder}/${folder}`;

        const uploadResult: any = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: targetFolder,
              resource_type: "image",
              tags: [folder, prefix],
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            },
          );
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
      } catch (cloudErr: any) {
        console.warn(
          `[Upload:${folder}] Cloudinary upload failed, falling back to local storage:`,
          cloudErr?.message || cloudErr,
        );
      }
    }

    // 2. Resilient local disk fallback
    const ext = file.mimetype.split("/")[1] || "png";
    const filename = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const targetDir = path.join(process.cwd(), "uploads", folder);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(path.join(targetDir, filename), file.buffer);

    const host = req.get("host") || `localhost:${env.PORT || 3007}`;
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
  public async uploadAndLinkProfilePicture(
    userId: string,
    file: Express.Multer.File,
    req: Request,
    type: "avatar" | "cover" = "avatar",
  ): Promise<{ url: string; secure_url: string; user: any; type: string }> {
    if (!userId) {
      throw new BadRequestError("User ID is required to link profile picture");
    }

    const uploadRes = await this.uploadToStorage(
      file,
      "profiles",
      type === "cover" ? "cover" : "avatar",
      req,
    );

    // Update user profile in database (server-sided link)
    const updatedUser = await userService.updateProfilePicture(
      userId,
      uploadRes.url,
      type,
    );

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
  public async uploadAndLinkPostPicture(
    userId: string,
    file: Express.Multer.File,
    req: Request,
    options: {
      postId?: string;
      postData?: Partial<IPost> & { tags?: any; allowComments?: any };
    } = {},
  ): Promise<{ url: string; secure_url: string; post?: any }> {
    const uploadRes = await this.uploadToStorage(file, "posts", "post", req);

    // Case 1: Link to existing post
    if (options.postId) {
      const post = await Post.findById(options.postId);
      if (!post) {
        throw new NotFoundError("Post not found");
      }

      if (post.ownerId && post.ownerId.toString() !== userId) {
        throw new ForbiddenError("You are not authorized to update this post's picture");
      }

      post.imageUrl = uploadRes.url;
      await post.save();
      const populatedPost = await post.populate(
        "ownerId",
        "name gender role avatar avatarUrl bio",
      );

      return {
        url: uploadRes.url,
        secure_url: uploadRes.secure_url,
        post: populatedPost,
      };
    }

    // Case 2: Create new post with image in ONE call
    if (options.postData?.title && options.postData?.content) {
      let tags: string[] = [];
      if (typeof options.postData.tags === "string") {
        try {
          tags = JSON.parse(options.postData.tags);
        } catch {
          tags = options.postData.tags
            .split(",")
            .map((t: string) => t.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(options.postData.tags)) {
        tags = options.postData.tags;
      }

      const allowComments =
        options.postData.allowComments === undefined
          ? true
          : String(options.postData.allowComments) !== "false";

      const createdPost = await postService.createPost({
        title: options.postData.title,
        content: options.postData.content,
        imageUrl: uploadRes.url,
        tags,
        allowComments,
        ownerId: userId as any,
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

export const uploadService = new UploadService();
