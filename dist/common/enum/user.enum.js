"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderType = exports.UserGender = exports.UserRole = void 0;
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
