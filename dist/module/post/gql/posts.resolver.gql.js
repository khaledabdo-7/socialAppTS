"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postGQLResolver = void 0;
class PostGQLResolver {
    constructor() { }
    helloResolver(parent, args) {
        console.log(args);
        return {
            message: `Hello ${args.title}, your content is ${args.content} and your ownerId is ${args.ownerId}`,
        };
    }
}
exports.postGQLResolver = new PostGQLResolver();
