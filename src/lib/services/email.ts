import crypto from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://haatnepal.pages.dev";

function generateConfirmationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function sendConfirmationEmail(
  email: string,
  displayName: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

  const confirmUrl = `${APP_URL}/api/auth/confirm-email?token=${token}`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "support@noreply.haatnepal.com",
        to: email,
        subject: "Confirm your email address",
        html: `
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
                <p>Hello ${displayName},</p>
                <p>Thank you for signing up to Haat Nepal! Click the link below to confirm your email address:</p>
                <a href="${confirmUrl}" class="button">Confirm Email</a>
                <p style="color: #6b7280; font-size: 14px;">Or copy this link: <br><code style="word-break: break-all;">${confirmUrl}</code></p>
                <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">This link expires in 24 hours.</p>
                <div class="footer">
                  <p>© 2026 Haat Nepal. All rights reserved.</p>
                  <p>Nepal's marketplace for buying, selling, and negotiating locally.</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[EMAIL] Resend API error:", error);
      return { success: false, error: "Failed to send confirmation email" };
    }

    console.log("[EMAIL] Confirmation email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending confirmation email:", error);
    return { success: false, error: "Error sending email" };
  }
}

export function generateConfirmationTokenForEmail(email: string): string {
  // Create a token that includes the email for verification
  const data = `${email}:${Date.now()}:${crypto.randomBytes(16).toString("hex")}`;
  return crypto.createHash("sha256").update(data).digest("hex");
}
