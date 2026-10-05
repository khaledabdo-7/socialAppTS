"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLSchema = void 0;
const post_types_gql_1 = require("./post.types.gql");
const post_args_gql_1 = require("./post.args.gql");
const posts_resolver_1 = require("./posts.resolver");
const post_types_gql_2 = require("./post.types.gql");
class PostGQLSchema {
    constructor() { }
    registerQuery() {
        return {
            helloPost: {
                name: "helloPostQuery",
                type: post_types_gql_1.PostGQLType,
                args: post_args_gql_1.PostGQLArgs,
                resolve: posts_resolver_1.postGQLResolver.helloResolver,
            },
            postList: {
                name: "postList",
                type: post_types_gql_2.PostListGQLType,
                args: post_args_gql_1.PostGQLArgs,
                resolve: posts_resolver_1.postGQLResolver.postList,
            },
        };
    }
    registerMutation() {
        return {
            createPost: {
                name: "createPost",
                type: post_types_gql_1.addPostGQLType,
                args: post_args_gql_1.addPostGQLArgs,
                resolve: posts_resolver_1.postGQLResolver.createPost,
            },
        };
    }
}
exports.postGQLSchema = new PostGQLSchema();
