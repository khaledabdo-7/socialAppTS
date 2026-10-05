"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostCommentType = exports.PostAuthorType = exports.ReplyGQLType = exports.ReactionGQLType = void 0;
const graphql_1 = require("graphql");
const reacts_enum_1 = require("../../common/enum/reacts.enum");
exports.ReactionGQLType = new graphql_1.GraphQLObjectType({
    name: "Reaction",
    fields: () => ({
        user: { type: graphql_1.GraphQLID },
        type: { type: reacts_enum_1.ReactGraphQLType },
    }),
});
exports.ReplyGQLType = new graphql_1.GraphQLObjectType({
    name: "Reply",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        commentId: { type: graphql_1.GraphQLID },
        user: { type: graphql_1.GraphQLID },
        content: { type: graphql_1.GraphQLString },
    }),
});
exports.PostAuthorType = new graphql_1.GraphQLObjectType({
    name: "PostAuthor",
    fields: () => ({
        id: { type: graphql_1.GraphQLID },
        name: { type: graphql_1.GraphQLString },
    }),
});
exports.PostCommentType = new graphql_1.GraphQLObjectType({
    name: "PostComment",
    fields: () => ({
        id: { type: graphql_1.GraphQLID },
        content: { type: graphql_1.GraphQLString },
        userId: { type: exports.PostAuthorType },
    }),
});
