import { z } from "zod";

export const listingConditions = ["new", "used"] as const;
export const listingTypes = ["classified", "fixed_price"] as const;
export const landUnitSystems = ["ropani_system", "bigha_system", "sqft", "sqm"] as const;
export const salaryPeriods = ["monthly", "yearly", "hourly", "daily"] as const;

export const listingSchema = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters").max(120),
  description: z.string().trim().min(20, "Description must be at least 20 characters").max(5000),
  price: z.coerce.number().min(0, "Price can't be negative").max(999_999_999),
  categoryId: z.string().uuid("Choose a category"),
  condition: z.enum(listingConditions),
  listingType: z.enum(listingTypes),
  district: z.string().trim().min(2, "Choose a district"),
  city: z.string().trim().max(120).optional().or(z.literal("")),
  municipality: z.string().trim().max(150).optional().or(z.literal("")),
  ward_number: z.coerce.number().int().min(1).max(99).optional().or(z.literal("")),
  tole: z.string().trim().max(150).optional().or(z.literal("")),
  land_unit_system: z.enum(landUnitSystems).optional().or(z.literal("")),
  land_ropani: z.coerce.number().int().min(0).optional().or(z.literal("")),
  land_aana: z.coerce.number().int().min(0).max(15).optional().or(z.literal("")),
  land_paisa: z.coerce.number().int().min(0).max(3).optional().or(z.literal("")),
  land_daam: z.coerce.number().int().min(0).max(3).optional().or(z.literal("")),
  land_bigha: z.coerce.number().int().min(0).optional().or(z.literal("")),
  land_kattha: z.coerce.number().int().min(0).max(19).optional().or(z.literal("")),
  land_dhur: z.coerce.number().int().min(0).max(19).optional().or(z.literal("")),
  land_area_sqft: z.coerce.number().min(0).optional().or(z.literal("")),
  company_name: z.string().trim().max(200).optional().or(z.literal("")),
  salary_min: z.coerce.number().min(0).optional().or(z.literal("")),
  salary_max: z.coerce.number().min(0).optional().or(z.literal("")),
  salary_period: z.enum(salaryPeriods).optional().or(z.literal("")),
  salary_negotiable: z.boolean().optional().default(false),
  vacancies_count: z.coerce.number().int().min(1).optional().or(z.literal("")),
  application_deadline: z.string().date().optional().or(z.literal("")),
  external_apply_url: z.string().url().optional().or(z.literal("")),
});

export type ListingInput = z.infer<typeof listingSchema>;
