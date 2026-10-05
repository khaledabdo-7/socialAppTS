"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userGQLResolver = void 0;
class UserGQLResolver {
    constructor() { }
    helloResolver(parent, args) {
        console.log(args);
        return {
            message: `Hello ${args.name}, your email is ${args.email} and your password is ${args.password}`,
        };
    }
}
exports.userGQLResolver = new UserGQLResolver();
