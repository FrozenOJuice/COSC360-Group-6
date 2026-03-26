import { z } from "zod";
import { buildObjectIdSchema } from "./schemaUtils.js";

export const createJobDiscussionCommentSchema = z.object({
    comment: z.string().trim().min(1, "Comment is required").max(2000, "Comment must be at most 2000 characters"),
}).strict();

export const jobDiscussionCommentParamsSchema = z.object({
    id: buildObjectIdSchema("Job id"),
    commentId: buildObjectIdSchema("Comment id"),
}).strict();
