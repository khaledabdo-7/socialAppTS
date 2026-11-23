"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGQLResolver = void 0;
class UserGQLResolver {
    constructor() { }
    helloResolver(parent, args) {
        return {
            message: `Hello ${args?.name || "User"}`,
        };
    }
}
exports.userGQLResolver = new UserGQLResolver();
