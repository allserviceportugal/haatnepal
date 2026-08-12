import { z } from "zod";

// Nepal phone validation (10 digits starting with 9, 8, 7, 6)
export const nepalPhoneRegex = /^[6789]\d{9}$/;

/**
 * SIGNUP: Email + Password + Name + Phone + Account Type + T&C Acceptance
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
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
  confirmPassword: z
    .string(),
  phone: z
    .string()
    .trim()
    .regex(nepalPhoneRegex, "Enter a valid Nepali phone number (98XXXXXXXX)"),
  accountType: z
    .enum(["individual", "business"])
    .default("individual"),
  acceptTerms: z
    .enum(["on"])
    .refine(() => true, "You must accept the Terms of Service and Privacy Policy"),
  subscribeNewsletter: z
    .enum(["on"])
    .optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
 * FORGOT PASSWORD: Email only (OTP will be sent)
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),
});

/**
 * LOGIN: Email + Password
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
  rememberMe: z
    .enum(["on", "off"])
    .optional()
    .default("on")
    .transform(v => v === "on"),
});

/**
 * SET PASSWORD: New password + confirm password
 */
export const setPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
  confirmPassword: z
    .string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SetPasswordInput = z.infer<typeof setPasswordSchema>;
