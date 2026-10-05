import { z } from "zod";

export const createPostSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(1, "Content is required"),
    image: z.string().url("Must be a valid URL").optional(),
    tags: z.array(z.string()).optional(),
    allowComments: z.boolean().optional().default(true),
    ownerId: z.string().min(1, "Owner ID is required"),
  })
  .strict();
