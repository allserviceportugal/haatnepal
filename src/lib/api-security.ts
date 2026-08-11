import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_KEY = process.env.ADMIN_API_KEY || "admin-secret-key-change-me";

export function verifyAdminApiKey(request: NextRequest): boolean {
  const apiKey = request.headers.get("x-admin-api-key");
  return apiKey === ADMIN_API_KEY;
}

export function createUnauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
}

// Simple in-memory rate limiter (for demo - use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests: number = 10, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export function createRateLimitedResponse() {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429 }
  );
}

export function sanitizeInput(input: string, maxLength: number = 1000): string {
  return input.trim().substring(0, maxLength).replace(/[<>]/g, "");
}
