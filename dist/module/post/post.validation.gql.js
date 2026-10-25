"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPostSchema = void 0;
const zod_1 = require("zod");
exports.createPostSchema = zod_1.z
    .object({
    title: zod_1.z.string().min(1, "Title is required"),
    content: zod_1.z.string().min(1, "Content is required"),
    image: zod_1.z.string().url("Must be a valid URL").optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    allowComments: zod_1.z.boolean().optional().default(true),
    ownerId: zod_1.z.string().min(1, "Owner ID is required"),
})
    .strict();
