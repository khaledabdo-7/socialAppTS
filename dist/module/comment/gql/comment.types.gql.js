"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneCommentGQLType = exports.CommentGQLType = void 0;
const graphql_1 = require("graphql");
const user_types_gql_1 = require("../../user/gql/user.types.gql");
const types_1 = require("../../gql/types");
exports.CommentGQLType = new graphql_1.GraphQLObjectType({
    name: "helloCommentQuery",
    fields: {
        message: {
            type: graphql_1.GraphQLString,
        },
    },
});
exports.oneCommentGQLType = new graphql_1.GraphQLObjectType({
    name: "Comment",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        postId: { type: graphql_1.GraphQLID },
        user: { type: user_types_gql_1.oneUserGQLType },
        content: { type: graphql_1.GraphQLString },
        mentions: { type: new graphql_1.GraphQLList(user_types_gql_1.oneUserGQLType) },
        imageUrl: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        replies: {
            type: new graphql_1.GraphQLList(types_1.ReplyGQLType),
        },
        reaction: {
            type: new graphql_1.GraphQLList(types_1.ReactionGQLType),
        },
    }),
});
