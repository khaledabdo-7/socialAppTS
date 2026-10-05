"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGQLSchema = void 0;
const user_args_gql_1 = require("./user.args.gql");
const user_types_gql_1 = require("./user.types.gql");
const user_resolver_1 = require("./user.resolver");
class UserGQLSchema {
    constructor() { }
    registerQuery() {
        return {
            helloUser: {
                name: "userQuery",
                type: user_types_gql_1.UserGQLType,
                args: user_args_gql_1.UserGQLArgs,
                resolve: user_resolver_1.userGQLResolver.helloResolver,
            },
        };
    }
}
exports.userGQLSchema = new UserGQLSchema();
