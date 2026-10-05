"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserGQLArgs = void 0;
const graphql_1 = require("graphql");
exports.UserGQLArgs = {
    name: {
        type: graphql_1.GraphQLString,
    },
    email: {
        type: graphql_1.GraphQLString,
    },
    password: {
        type: graphql_1.GraphQLString,
    },
};
