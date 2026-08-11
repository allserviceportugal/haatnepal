const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendWelcomeEmail(
  email: string,
  displayName: string
): Promise<{ success: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.error("[EMAIL] RESEND_API_KEY not configured");
    return { success: false, error: "Email service not configured" };
  }

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
        subject: "Welcome to Haat Nepal!",
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
              .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>haatnepal</h1>
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">Welcome!</p>
              </div>
              <div class="content">
                <p>Hi ${displayName},</p>
                <p>Welcome to Haat Nepal! Your account has been created successfully and you're ready to start buying and selling.</p>
                <p>You can now:</p>
                <ul>
                  <li>Browse listings from across Nepal</li>
                  <li>Create your own listings</li>
                  <li>Message sellers and buyers</li>
                  <li>Manage your favorites and orders</li>
                </ul>
                <p>If you have any questions, feel free to reach out to us.</p>
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
      return { success: false, error: "Failed to send welcome email" };
    }

    console.log("[EMAIL] Welcome email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending welcome email:", error);
    return { success: false, error: "Error sending email" };
  }
}
