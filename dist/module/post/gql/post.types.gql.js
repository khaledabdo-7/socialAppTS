"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPostGQLType = exports.PostListGQLType = exports.onePostType = exports.PostGQLType = void 0;
const graphql_1 = require("graphql");
const types_1 = require("../../gql/types");
exports.PostGQLType = new graphql_1.GraphQLObjectType({
    name: "helloPostQuery",
    fields: {
        message: {
            type: graphql_1.GraphQLString,
        },
    },
});
exports.onePostType = new graphql_1.GraphQLObjectType({
    name: "onePost",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        title: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        comments: {
            type: new graphql_1.GraphQLList(graphql_1.GraphQLID),
        },
        owner: { type: graphql_1.GraphQLID },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        allowComments: { type: graphql_1.GraphQLBoolean },
        imageUrl: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        reaction: {
            type: new graphql_1.GraphQLList(types_1.ReactionGQLType),
        },
    }),
});
exports.PostListGQLType = new graphql_1.GraphQLObjectType({
    name: "PostList",
    fields: () => ({
        posts: {
            type: new graphql_1.GraphQLList(exports.onePostType),
            resolve: (parent, args) => {
                return parent.posts;
            },
        },
    }),
});
exports.addPostGQLType = new graphql_1.GraphQLObjectType({
    name: "addPost",
    fields: () => ({
        id: { type: graphql_1.GraphQLID },
        title: { type: graphql_1.GraphQLString },
        content: { type: graphql_1.GraphQLString },
        comments: {
            type: new graphql_1.GraphQLList(graphql_1.GraphQLID),
        },
        owner: { type: graphql_1.GraphQLID },
        tags: { type: new graphql_1.GraphQLList(graphql_1.GraphQLID) },
        allowComments: { type: graphql_1.GraphQLBoolean },
        imageUrl: { type: new graphql_1.GraphQLList(graphql_1.GraphQLString) },
        reaction: {
            type: new graphql_1.GraphQLList(types_1.ReactionGQLType),
        },
    }),
});
