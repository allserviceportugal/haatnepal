import { z } from "zod";

// Nepal phone validation (10 digits starting with 9, 8, 7, 6)
export const nepalPhoneRegex = /^[6789]\d{9}$/;

/**
 * SIGNUP: Email + Name + Phone + Account Type (NO PASSWORD)
 */
export const signUpSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name too long"),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(nepalPhoneRegex, "Enter a valid Nepali phone number (98XXXXXXXX)"),
  accountType: z
    .enum(["individual", "business"])
    .default("individual"),
});

/**
 * VERIFY CODE: Email + 6-digit OTP
 */
export const verifyCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email"),
  code: z
    .string()
    .length(6, "Code must be 6 digits")
    .regex(/^\d{6}$/, "Code must be numbers only"),
});

/**
 * LOGIN: Email only (OTP will be sent)
 */
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
