"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLResolver = void 0;
const post_service_1 = __importDefault(require("../service/post.service"));
const graphQLAuth_middleware_1 = require("../../../middleware/graphQLAuth.middleware");
class PostGQLResolver {
    postService;
    constructor() {
        this.postService = post_service_1.default;
    }
    helloResolver = async (parent, args) => {
        return {
            message: "hello",
        };
    };
    postList = async (parent, args, context) => {
        console.log(context);
        await (0, graphQLAuth_middleware_1.graphQLAuthMiddleware)(context);
        let postData = await this.postService.getAllPosts(args.ownerId);
        const customPostData = postData.map((post) => {
            id: post.id;
            title: post.title;
            content: post.content;
        });
        return {
            posts: customPostData,
        };
    };
    createPost = async (parent, args, context) => {
        console.log(context);
        await (0, graphQLAuth_middleware_1.graphQLAuthMiddleware)(context);
        let postData = await this.postService.createPost({
            ...args,
            comments: [],
            reaction: [],
        });
        return {
            post: postData,
        };
    };
}
exports.postGQLResolver = new PostGQLResolver();
