import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const HOOK_SECRET = process.env.SUPABASE_HOOK_SECRET || "";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

function verifySupabaseWebhook(
  body: string,
  signature: string,
  secret: string
): boolean {
  if (!secret) {
    console.warn("[AUTH HOOK] No SUPABASE_HOOK_SECRET configured, skipping verification");
    return true; // Allow if no secret configured (for local testing)
  }

  try {
    // Extract the base secret from v1,whsec_... format
    const secretParts = secret.split(",");
    if (secretParts.length !== 2) {
      console.error("[AUTH HOOK] Invalid secret format");
      return false;
    }

    const baseSecret = secretParts[1];
    const decodedSecret = Buffer.from(baseSecret, "base64");

    // Verify using HMAC
    const hmac = crypto.createHmac("sha256", decodedSecret);
    const computed = hmac.update(body).digest("base64");

    return signature === `v1,${computed}`;
  } catch (error) {
    console.error("[AUTH HOOK] Verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[AUTH HOOK] Received request");

    // Get the raw body for signature verification
    const body = await request.text();
    const signature = request.headers.get("svix-signature") || "";

    // Verify webhook signature
    if (!verifySupabaseWebhook(body, signature, HOOK_SECRET)) {
      console.error("[AUTH HOOK] Webhook signature verification failed");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    console.log("[AUTH HOOK] Parsed body:", { type: data.type, email: data.email });

    const { type, email, confirmation_url } = data;

    console.log("[AUTH HOOK] Received hook:", { type, email });

    if (!RESEND_API_KEY) {
      console.error("[AUTH HOOK] RESEND_API_KEY not set");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    let subject = "";
    let html = "";

    if (type === "signup" || type === "invite") {
      subject = "Confirm your email address";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 30px; }
            .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>haatnepal</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Confirm Your Email</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>Thank you for signing up to Haat Nepal! Click the link below to confirm your email address:</p>
              <a href="${confirmation_url}" class="button">Confirm Email</a>
              <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br><code style="word-break: break-all;">${confirmation_url}</code></p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
              <div class="footer">
                <p>© 2026 Haat Nepal. All rights reserved.</p>
                <p>Nepal's marketplace for buying, selling, and negotiating locally.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else if (type === "recovery") {
      subject = "Reset your password";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
            .content { background: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 30px; }
            .button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>haatnepal</h1>
              <p style="margin: 0; font-size: 14px; opacity: 0.9;">Password Reset</p>
            </div>
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the link below to set a new password:</p>
              <a href="${confirmation_url}" class="button">Reset Password</a>
              <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br><code style="word-break: break-all;">${confirmation_url}</code></p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This link expires in 1 hour.</p>
              <p style="color: #dc2626; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
              <div class="footer">
                <p>© 2026 Haat Nepal. All rights reserved.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    } else {
      console.log("[AUTH HOOK] Skipping unknown hook type:", type);
      return NextResponse.json({ success: true });
    }

    // Send via Resend
    console.log("[AUTH HOOK] Sending email via Resend:", { to: email, type });
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "support@noreply.haatnepal.com",
        to: email,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const error = await resendResponse.json();
      console.error("[AUTH HOOK] Resend API error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    console.log("[AUTH HOOK] Email sent successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH HOOK] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
