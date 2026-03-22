import { z } from "zod";

export const createJobDiscussionCommentSchema = z.object({
    comment: z.string().trim().min(1, "Comment is required").max(2000, "Comment must be at most 2000 characters"),
}).strict();
