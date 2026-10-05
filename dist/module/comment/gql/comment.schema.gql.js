"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLSchema = void 0;
const comment_types_gql_1 = require("./comment.types.gql");
class PostGQLSchema {
    constructor() { }
    registerQuery() {
        return {
            helloComment: {
                name: "helloCommentQuery",
                type: comment_types_gql_1.CommentGQLType,
                // args: CommentGQLArgs,
                // resolve: postGQLResolver.helloResolver,
            },
        };
    }
}
exports.postGQLSchema = new PostGQLSchema();
