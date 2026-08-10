import { createClient } from "@/lib/supabase/server";

/**
 * Generate a random 6-digit OTP code
 */
export function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create an OTP code for the given email and store in database
 */
export async function createOtpCode(
  email: string,
  metadata: {
    display_name: string;
    phone: string;
    account_type: "individual" | "business";
  }
): Promise<{ code: string; error?: string }> {
  try {
    const supabase = await createClient();
    const code = generateOtpCode();

    const { error } = await supabase.from("otp_codes").insert({
      email,
      code,
      metadata,
    });

    if (error) {
      console.error("Error creating OTP code:", error);
      return { code: "", error: "Failed to create verification code" };
    }

    return { code };
  } catch (err) {
    console.error("Exception creating OTP code:", err);
    return { code: "", error: "An error occurred" };
  }
}

/**
 * Verify an OTP code and return the metadata if valid
 */
export async function verifyOtpCode(
  email: string,
  code: string
): Promise<{
  valid: boolean;
  metadata?: { display_name: string; phone: string; account_type: string };
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("otp_codes")
      .select("metadata, attempts")
      .eq("email", email)
      .eq("code", code)
      .gt("expires_at", new Date().toISOString())
      .is("verified_at", null)
      .single();

    if (error) {
      return { valid: false, error: "Invalid or expired code" };
    }

    if (!data) {
      return { valid: false, error: "Code not found" };
    }

    // Limit attempts to 5
    if (data.attempts >= 5) {
      return { valid: false, error: "Too many attempts. Request a new code." };
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("otp_codes")
      .update({ verified_at: new Date().toISOString() })
      .eq("email", email)
      .eq("code", code);

    if (updateError) {
      return { valid: false, error: "Failed to verify code" };
    }

    return {
      valid: true,
      metadata: data.metadata,
    };
  } catch (err) {
    console.error("Exception verifying OTP code:", err);
    return { valid: false, error: "An error occurred" };
  }
}

/**
 * Increment attempt counter for an OTP code
 */
export async function incrementOtpAttempts(email: string, code: string): Promise<void> {
  try {
    const supabase = await createClient();

    await supabase.rpc("increment_otp_attempts", {
      email,
      code,
    });
  } catch (err) {
    console.error("Error incrementing OTP attempts:", err);
  }
}
