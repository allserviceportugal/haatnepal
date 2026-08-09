import { z } from "zod";

export const jobApplicationSchema = z.object({
  coverNote: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;
