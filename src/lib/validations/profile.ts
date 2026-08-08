import { z } from "zod";

export const profileSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  district: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  businessDescription: z.string().trim().max(500).optional().or(z.literal("")),
  logoUrl: z.string().trim().max(2048).optional().or(z.literal("")),
  coverImageUrl: z.string().trim().max(2048).optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
