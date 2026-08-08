import { z } from "zod";

export const nepalPhoneRegex = /^(\+977[- ]?)?9[678]\d{8}$/;

export const signUpSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().email("Enter a valid email address"),
  phone: z.string().trim().regex(nepalPhoneRegex, "Enter a valid Nepali mobile number (e.g. 98XXXXXXXX)"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  accountType: z.enum(["individual", "business"]),
});

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
