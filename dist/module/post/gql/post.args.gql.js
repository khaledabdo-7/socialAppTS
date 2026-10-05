"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addPostGQLArgs = exports.PostListGQLArgs = exports.PostGQLArgs = void 0;
const graphql_1 = require("graphql");
exports.PostGQLArgs = {
    title: {
        type: graphql_1.GraphQLString,
    },
    content: {
        type: graphql_1.GraphQLString,
    },
    ownerId: {
        type: graphql_1.GraphQLString,
    },
    tags: {
        type: graphql_1.GraphQLString,
    },
    imageUrl: {
        type: graphql_1.GraphQLString,
    },
    reaction: {
        type: graphql_1.GraphQLString,
    },
};
exports.PostListGQLArgs = {};
exports.addPostGQLArgs = {
    userId: {
        type: graphql_1.GraphQLString,
    },
    tags: {
        type: new graphql_1.GraphQLList(graphql_1.GraphQLString),
    },
    title: {
        type: graphql_1.GraphQLString,
    },
    content: {
        type: graphql_1.GraphQLString,
    },
    allowComments: {
        type: graphql_1.GraphQLBoolean,
        defaultValue: true,
    },
    imageUrl: {
        type: new graphql_1.GraphQLList(graphql_1.GraphQLString),
    },
};
