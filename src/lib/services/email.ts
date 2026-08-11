/**
 * Send email via Resend API
 */
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    console.log("[EMAIL] Sending email", {
      to,
      apiKeySet: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
      apiKeyPrefix: apiKey?.substring(0, 10) + "...",
    });

    if (!apiKey) {
      console.error("[EMAIL] ERROR: RESEND_API_KEY is not set in environment");
      return false;
    }

    const payload = {
      from: "support@noreply.haatnepal.com",
      to,
      subject,
      html,
    };

    console.log("[EMAIL] Calling Resend API with payload", { from: payload.from, to: payload.to });

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    console.log("[EMAIL] Resend API response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[EMAIL] ERROR from Resend API:", {
        status: response.status,
        error: errorData,
      });
      return false;
    }

    const successData = await response.json();
    console.log("[EMAIL] SUCCESS - Resend API response:", successData);
    return true;
  } catch (error) {
    console.error("[EMAIL] ERROR - Exception during email send:", {
      message: String(error),
      error,
    });
    return false;
  }
}

/**
 * Send OTP verification email with haatnepal branding
 */
export async function sendOtpEmail(email: string, code: string): Promise<boolean> {
  try {
    const html = `
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
    .code-box {
      background: #f3f4f6;
      border: 2px solid #ea580c;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 8px;
      color: #ea580c;
      font-family: 'Courier New', monospace;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    .warning { color: #dc2626; font-size: 13px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>haatnepal</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Verify Your Account</p>
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>Thanks for signing up to <strong>Haat Nepal</strong>! To complete your account verification, please enter the code below:</p>

      <div class="code-box">
        <div class="code">${code}</div>
      </div>

      <p style="color: #6b7280; font-size: 14px;">This code will expire in 10 minutes.</p>

      <p style="margin-top: 30px;">Once verified, you'll be able to:</p>
      <ul style="color: #6b7280;">
        <li>Create listings and sell items</li>
        <li>Browse and buy from local sellers</li>
        <li>Message sellers and negotiate</li>
      </ul>

      <div class="warning">
        ⚠️ If you didn't request this code, please ignore this email. Your account won't be created.
      </div>

      <div class="footer">
        <p>© 2026 Haat Nepal. All rights reserved.</p>
        <p>Nepal's marketplace for buying, selling, and negotiating locally.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const success = await sendEmail(email, "Verify Your Haat Nepal Account - 6-Digit Code", html);
    if (!success) {
      return false;
    }

    console.log(`📧 OTP Email sent to ${email}: ${code}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(email: string, displayName: string): Promise<boolean> {
  try {
    const html = `
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
    .cta { display: inline-block; background: #ea580c; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>haatnepal</h1>
      <p style="margin: 0; font-size: 14px; opacity: 0.9;">Welcome to Nepal's Marketplace</p>
    </div>

    <div class="content">
      <p>Welcome, <strong>${displayName}</strong>! 🎉</p>
      <p>Your account has been successfully verified. You're now ready to start buying and selling on Haat Nepal!</p>

      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://haatnepal.shrill-sea-82d6.workers.dev'}" class="cta">Go to Haat Nepal</a>
      </div>

      <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
        <strong>Quick tips:</strong><br>
        • Complete your profile to build trust with buyers<br>
        • Upload clear photos when listing items<br>
        • Be responsive to buyer messages<br>
        • Use in-app messaging for secure negotiations
      </p>

      <div class="footer">
        <p>© 2026 Haat Nepal. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
    `;

    const success = await sendEmail(email, "Welcome to Haat Nepal! 🎉", html);
    if (!success) {
      return false;
    }

    console.log(`📧 Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending welcome email:", error);
    return false;
  }
}
