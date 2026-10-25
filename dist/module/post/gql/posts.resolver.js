"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLResolver = void 0;
const post_service_1 = __importDefault(require("../service/post.service"));
const graphQLAuth_middleware_1 = require("../../../middleware/graphQLAuth.middleware");
const validation_middleware_1 = require("../../../middleware/validation.middleware");
const post_validation_gql_1 = require("../post.validation.gql");
const error_response_1 = require("../../../common/response/error.response");
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
        try {
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
        }
        catch (error) {
            if (error.statusCode) {
                (0, error_response_1.mapGraphQLError)(error);
            }
            throw new Error("An unexpected error occurred");
        }
    };
    createPost = async (parent, args, context) => {
        try {
            console.log(context);
            await (0, graphQLAuth_middleware_1.graphQLAuthMiddleware)(context);
            const validatedArgs = (0, validation_middleware_1.GQLValidation)(post_validation_gql_1.createPostSchema, args);
            let newPostPayload = {
                ...validatedArgs,
                comments: [],
                reaction: [],
            };
            let postData = await this.postService.createPost(newPostPayload);
            return {
                post: postData,
            };
        }
        catch (error) {
            if (error.statusCode) {
                (0, error_response_1.mapGraphQLError)(error);
            }
            throw new Error("An unexpected error occurred");
        }
    };
}
exports.postGQLResolver = new PostGQLResolver();
