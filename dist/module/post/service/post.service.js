"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const post_1 = require("../../../database/model/post");
const database_repositorie_1 = require("../../../database/repositories/database.repositorie");
class PostService {
    postRepository;
    constructor() {
        this.postRepository = new database_repositorie_1.DatabaseRepository(post_1.Post);
    }
    async createPost(postData) {
        console.log("Post data in service:", postData); // Log the post data to verify its structure
        const newPost = await this.postRepository.create(postData);
        console.log("New post created:", newPost); // Log the new post to verify its structure
        await newPost.save();
        return newPost;
    }
    async getAllPosts(userId) {
        const posts = await this.postRepository.findAll({ filter: { ownerId: userId } });
        return posts;
    }
    async getPostById(postId) {
        const post = await this.postRepository.findOne({ filter: { id: postId } });
        return post;
    }
}
exports.default = new PostService();
