"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oneUserGQLType = exports.UserGQLType = void 0;
const graphql_1 = require("graphql");
const user_enum_1 = require("../../../common/enum/user.enum");
exports.UserGQLType = new graphql_1.GraphQLObjectType({
    name: "userQuery",
    fields: {
        message: {
            type: graphql_1.GraphQLString,
        },
    },
});
exports.oneUserGQLType = new graphql_1.GraphQLObjectType({
    name: "oneUserQuery",
    fields: () => ({
        id: { type: graphql_1.GraphQLString },
        name: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        email: { type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLString) },
        role: { type: user_enum_1.graphqlUserRole },
        gender: { type: user_enum_1.graphqlUserGender },
        provider: { type: user_enum_1.graphqlProviderType },
        isDeactivated: { type: graphql_1.GraphQLBoolean },
        isVerified: { type: graphql_1.GraphQLBoolean },
        isPrivate: { type: graphql_1.GraphQLBoolean },
    }),
});
