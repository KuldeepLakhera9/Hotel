import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment is too long"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
