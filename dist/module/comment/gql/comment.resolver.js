"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentGQLResolver = void 0;
class CommentGQLResolver {
    constructor() { }
    helloResolver(parent, args) {
        console.log(args);
        return {
            message: `Hello ${args.title}, your content is ${args.content} and your ownerId is ${args.ownerId}`,
        };
    }
}
exports.commentGQLResolver = new CommentGQLResolver();
