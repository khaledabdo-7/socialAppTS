"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const post_1 = require("../../../database/model/post");
class PostService {
    async createPost(postData) {
        console.log("Post data in service:", postData); // Log the post data to verify its structure
        const newPost = new post_1.Post(postData);
        console.log("New post created:", newPost); // Log the new post to verify its structure
        await newPost.save();
        return newPost;
    }
    async getPosts(userId) {
        const posts = await post_1.Post.find({ ownerId: userId });
        return posts;
    }
    async getPostById(postId) {
        const post = await post_1.Post.findById(postId);
        return post;
    }
}
exports.PostService = PostService;
