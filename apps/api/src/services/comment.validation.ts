import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().trim().min(1, "Comment content cannot be empty"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const validateCreateComment = (
  input: unknown
): CreateCommentInput => createCommentSchema.parse(input);
