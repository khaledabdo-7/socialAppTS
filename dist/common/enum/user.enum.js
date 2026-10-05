"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphqlProviderType = exports.graphqlUserGender = exports.graphqlUserRole = exports.ProviderType = exports.UserGender = exports.UserRole = void 0;
const graphql_1 = require("graphql");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var UserGender;
(function (UserGender) {
    UserGender["MALE"] = "male";
    UserGender["FEMALE"] = "female";
})(UserGender || (exports.UserGender = UserGender = {}));
var ProviderType;
(function (ProviderType) {
    ProviderType["GOOGLE"] = "google";
    ProviderType["FACEBOOK"] = "facebook";
    ProviderType["SYSTEM"] = "system";
})(ProviderType || (exports.ProviderType = ProviderType = {}));
exports.graphqlUserRole = new graphql_1.GraphQLEnumType({
    name: "UserRole",
    values: {
        ADMIN: { value: UserRole.ADMIN },
        USER: { value: UserRole.USER },
    },
});
exports.graphqlUserGender = new graphql_1.GraphQLEnumType({
    name: "UserGender",
    values: {
        MALE: { value: UserGender.MALE },
        FEMALE: { value: UserGender.FEMALE },
    },
});
exports.graphqlProviderType = new graphql_1.GraphQLEnumType({
    name: "ProviderType",
    values: {
        GOOGLE: { value: ProviderType.GOOGLE },
        FACEBOOK: { value: ProviderType.FACEBOOK },
        SYSTEM: { value: ProviderType.SYSTEM },
    },
});
