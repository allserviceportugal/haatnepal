import { z } from "zod";

export const listingConditions = ["new", "used"] as const;
export const listingTypes = ["classified", "fixed_price"] as const;

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
  price: z.coerce.number().min(0, "Price can't be negative").max(999_999_999),
  categoryId: z.string().uuid("Choose a category"),
  condition: z.enum(listingConditions),
  listingType: z.enum(listingTypes),
  district: z.string().trim().min(2, "Choose a district"),
  city: z.string().trim().max(120).optional().or(z.literal("")),
});

export type ListingInput = z.infer<typeof listingSchema>;
