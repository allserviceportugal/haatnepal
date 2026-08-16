const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function sendWelcomeEmail(
  email: string,
  displayName: string,
  password?: string
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
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
              .header p { font-size: 16px; opacity: 0.95; font-weight: 500; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; }
              .message { color: #4b5563; margin-bottom: 25px; }
              .features { margin: 30px 0; }
              .features-title { font-size: 16px; font-weight: 700; color: #111827; margin-bottom: 15px; }
              .feature-list { list-style: none; }
              .feature-list li { padding: 12px 0; padding-left: 30px; position: relative; color: #4b5563; }
              .feature-list li:before { content: "✓"; position: absolute; left: 0; color: #ea580c; font-weight: bold; font-size: 18px; }
              .cta-section { margin: 30px 0; padding: 25px; background-color: #fef3f2; border-left: 4px solid #ea580c; border-radius: 8px; }
              .cta-text { color: #7c2d12; font-size: 14px; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
              .footer-text strong { color: #111827; }
              .help-link { color: #ea580c; text-decoration: none; font-weight: 600; }
              .help-link:hover { text-decoration: underline; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Haat Nepal</h1>
                <p>Your marketplace awaits!</p>
              </div>

              <div class="content">
                <p class="greeting">Welcome to Haat Nepal, ${displayName}!</p>

                <p class="message">We're thrilled you've joined our community! Your account is now active and ready to use. Whether you're looking to buy, sell, or negotiate with local vendors, you've come to the right place.</p>

                <div class="features">
                  <p class="features-title">What you can do now:</p>
                  <ul class="feature-list">
                    <li>Browse thousands of listings from across Nepal</li>
                    <li>Create your own listings and reach buyers instantly</li>
                    <li>Message sellers and buyers directly</li>
                    <li>Manage your favorites and track orders</li>
                    <li>Build your reputation as a trusted seller/buyer</li>
                  </ul>
                </div>

                <div class="cta-section">
                  <p class="cta-text">💡 <strong>Pro tip:</strong> Complete your profile with a photo and description to build trust with other users and increase your chances of successful trades.</p>
                </div>

                <p class="message">Get started today and discover amazing deals from your neighbors and across Nepal!</p>

                <div class="divider"></div>

                ${password ? `
                <div style="background-color: #fef3f2; border-left: 4px solid #ea580c; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-weight: 700; color: #7c2d12; margin-bottom: 10px;">Your Login Credentials:</p>
                  <p style="font-size: 14px; color: #4b5563; margin: 8px 0;">
                    <strong>Email:</strong> ${email}
                  </p>
                  <p style="font-size: 14px; color: #4b5563; margin: 8px 0;">
                    <strong>Password:</strong> ${password}
                  </p>
                  <p style="font-size: 12px; color: #dc2626; margin-top: 12px; padding-top: 12px; border-top: 1px solid #fed7aa;">
                    ⚠️ <strong>Keep this password safe and never share it with anyone.</strong> Do not share your login credentials with other users.
                  </p>
                </div>
                ` : ''}

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563; margin-bottom: 15px;">
                  <strong>Need help?</strong> Our support team is here to assist you. If you have any questions, don't hesitate to reach out.
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong><br>
                  Nepal's marketplace for buying, selling, and negotiating locally<br><br>
                  © 2026 Haat Nepal. All rights reserved.<br>
                  <a href="https://haatnepal.com" class="help-link">Visit our website</a>
                </p>
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

export async function sendOtpVerificationEmail(
  email: string,
  displayName: string,
  code: string
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
        subject: "Verify your Haat Nepal account",
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
              .header p { font-size: 16px; opacity: 0.95; font-weight: 500; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; }
              .message { color: #4b5563; margin-bottom: 25px; }
              .code-section { margin: 30px 0; padding: 30px; background-color: #fef3f2; border-left: 4px solid #ea580c; border-radius: 8px; text-align: center; }
              .code { font-size: 48px; font-weight: 800; color: #ea580c; letter-spacing: 8px; margin: 20px 0; font-family: monospace; }
              .code-note { font-size: 12px; color: #7c2d12; margin-top: 15px; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
              .help-link { color: #ea580c; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🔐 Verify Your Email</h1>
                <p>Complete your account setup</p>
              </div>

              <div class="content">
                <p class="greeting">Welcome to Haat Nepal, ${displayName}!</p>

                <p class="message">Your account is almost ready! Enter the verification code below to complete your signup and start buying and selling on Nepal's premier marketplace.</p>

                <div class="code-section">
                  <p style="color: #7c2d12; margin-bottom: 10px;">Your verification code:</p>
                  <div class="code">${code}</div>
                  <p class="code-note">This code expires in 10 minutes. Do not share it with anyone.</p>
                </div>

                <p class="message">If you didn't sign up for this account, you can safely ignore this email.</p>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563;">
                  <strong>Need help?</strong> Our support team is here to assist. Visit <a href="https://haatnepal.com/help" style="color: #ea580c; text-decoration: none;">our help center</a> or contact support.
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong><br>
                  Nepal's marketplace for buying, selling, and negotiating locally<br><br>
                  © 2026 Haat Nepal. All rights reserved.<br>
                  <a href="https://haatnepal.com" class="help-link">Visit our website</a>
                </p>
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
      return { success: false, error: "Failed to send OTP email" };
    }

    console.log("[EMAIL] OTP verification email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending OTP email:", error);
    return { success: false, error: "Error sending email" };
  }
}

export async function sendVerificationRequestReceivedEmail(
  businessName: string,
  contactPersonName: string,
  contactEmail: string,
  contactPhone: string,
  requestedPlanKey: string
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
        to: "hello@haatnepal.com",
        reply_to: contactEmail,
        subject: `New ${requestedPlanKey} plan verification request — ${businessName}`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 28px; font-weight: 800; margin-bottom: 10px; }
              .content { padding: 40px 30px; }
              .details-section { margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
              .details-row { display: flex; padding: 8px 0; font-size: 14px; }
              .details-label { font-weight: 700; color: #111827; min-width: 140px; }
              .details-value { color: #4b5563; }
              .cta-button { display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 25px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>New verification request</h1>
                <p>Requesting the ${requestedPlanKey} plan</p>
              </div>

              <div class="content">
                <p style="color: #4b5563; margin-bottom: 20px;">
                  A user has submitted a business verification request for the <strong>${requestedPlanKey}</strong> plan.
                </p>

                <div class="details-section">
                  <div class="details-row"><span class="details-label">Business name:</span><span class="details-value">${businessName}</span></div>
                  <div class="details-row"><span class="details-label">Contact person:</span><span class="details-value">${contactPersonName}</span></div>
                  <div class="details-row"><span class="details-label">Contact email:</span><span class="details-value">${contactEmail}</span></div>
                  <div class="details-row"><span class="details-label">Contact phone:</span><span class="details-value">${contactPhone}</span></div>
                </div>

                <div style="text-align: center;">
                  <a href="https://haatnepal.com/admin/verifications" class="cta-button">Review in admin panel</a>
                </div>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563;">
                  Reply directly to this email to reach the applicant, or approve/reject the request from the admin panel.
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong> — internal notification<br>
                  © 2026 Haat Nepal.
                </p>
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
      return { success: false, error: "Failed to send verification request notification email" };
    }

    console.log("[EMAIL] Verification request notification sent to hello@haatnepal.com for:", businessName);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending verification request notification email:", error);
    return { success: false, error: "Error sending email" };
  }
}

export async function sendVerificationApprovedEmail(
  email: string,
  displayName: string,
  planName: string
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
        subject: `Your ${planName} upgrade is approved`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; }
              .message { color: #4b5563; margin-bottom: 25px; }
              .success-section { margin: 30px 0; padding: 25px; background-color: #ecfdf5; border-left: 4px solid #10b981; border-radius: 8px; }
              .success-text { color: #065f46; font-size: 14px; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
              .help-link { color: #10b981; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✓ Upgrade Approved</h1>
                <p>Your business verification is complete</p>
              </div>

              <div class="content">
                <p class="greeting">Great news, ${displayName}!</p>

                <p class="message">
                  Your business verification has been approved! Your account has been upgraded to the <strong>${planName}</strong> plan and you can now enjoy all the benefits it offers.
                </p>

                <div class="success-section">
                  <p class="success-text">
                    <strong>What's next?</strong> Your upgraded plan is now active. Visit your <a href="https://haatnepal.com/dashboard/plan" style="color: #065f46; text-decoration: underline;">dashboard</a> to see your new features and limits.
                  </p>
                </div>

                <p class="message">
                  If you have any questions about your new plan or need assistance, please don't hesitate to reach out to our support team.
                </p>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563;">
                  Thank you for choosing Haat Nepal!
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong><br>
                  Nepal's marketplace for buying, selling, and negotiating locally<br><br>
                  © 2026 Haat Nepal. All rights reserved.
                </p>
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
      return { success: false, error: "Failed to send approval email" };
    }

    console.log("[EMAIL] Verification approved email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending approval email:", error);
    return { success: false, error: "Error sending email" };
  }
}

export async function sendVerificationRejectedEmail(
  email: string,
  displayName: string,
  planName: string,
  reason: string
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
        subject: `Your ${planName} upgrade request needs more information`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 32px; font-weight: 800; margin-bottom: 10px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 20px; }
              .message { color: #4b5563; margin-bottom: 25px; }
              .reason-section { margin: 30px 0; padding: 25px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; }
              .reason-title { color: #92400e; font-weight: 700; margin-bottom: 12px; }
              .reason-text { color: #78350f; font-size: 14px; line-height: 1.6; }
              .action-section { margin: 30px 0; padding: 25px; background-color: #f0f9ff; border-left: 4px solid #3b82f6; border-radius: 8px; }
              .action-text { color: #1e40af; font-size: 14px; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
              .help-link { color: #f59e0b; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verification Update</h1>
                <p>Your ${planName} upgrade request needs review</p>
              </div>

              <div class="content">
                <p class="greeting">Hello ${displayName},</p>

                <p class="message">
                  Thank you for submitting your business verification request for the <strong>${planName}</strong> plan. After our review, we need some additional information or clarification before we can approve your upgrade.
                </p>

                <div class="reason-section">
                  <p class="reason-title">Reason for review:</p>
                  <p class="reason-text">${reason}</p>
                </div>

                <p class="message">
                  Don't worry! This is a common part of our verification process. Simply resubmit your verification with the necessary corrections or additional documentation, and we'll review it again.
                </p>

                <div class="action-section">
                  <p class="action-text">
                    <strong>Next step:</strong> Visit your <a href="https://haatnepal.com/dashboard/plan" style="color: #1e40af; text-decoration: underline;">dashboard</a> to resubmit your verification request. The process is quick and takes just a few minutes.
                  </p>
                </div>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563;">
                  If you have any questions about the verification process or need assistance, please contact our support team. We're here to help!
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong><br>
                  Nepal's marketplace for buying, selling, and negotiating locally<br><br>
                  © 2026 Haat Nepal. All rights reserved.
                </p>
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
      return { success: false, error: "Failed to send rejection email" };
    }

    console.log("[EMAIL] Verification rejected email sent to:", email);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending rejection email:", error);
    return { success: false, error: "Error sending email" };
  }
}

export async function sendNewMessageEmail(
  toEmail: string,
  toName: string,
  fromName: string,
  fromEmail: string,
  listingTitle: string,
  messageBody: string,
  conversationUrl: string
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
        to: toEmail,
        reply_to: fromEmail,
        subject: `New message from ${fromName} about "${listingTitle}"`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; line-height: 1.6; color: #1f2937; background-color: #f9fafb; }
              .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; padding: 40px 30px; text-align: center; }
              .header h1 { font-size: 24px; font-weight: 800; margin-bottom: 10px; }
              .content { padding: 40px 30px; }
              .greeting { font-size: 16px; font-weight: 600; color: #111827; margin-bottom: 15px; }
              .listing-info { margin: 25px 0; padding: 20px; background-color: #fef3f2; border-left: 4px solid #ea580c; border-radius: 8px; }
              .listing-title { font-weight: 700; color: #7c2d12; margin-bottom: 8px; }
              .sender-info { font-size: 14px; color: #4b5563; margin: 8px 0; }
              .message-section { margin: 25px 0; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
              .message-label { font-weight: 600; color: #111827; margin-bottom: 12px; }
              .message-body { color: #4b5563; line-height: 1.8; white-space: pre-wrap; word-break: break-word; }
              .cta-button { display: inline-block; margin-top: 20px; padding: 12px 30px; background-color: #ea580c; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; }
              .cta-button:hover { background-color: #dc4a04; }
              .reply-note { margin-top: 25px; padding: 15px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 8px; font-size: 12px; color: #1e40af; }
              .divider { height: 1px; background-color: #e5e7eb; margin: 25px 0; }
              .footer { background-color: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
              .footer-text { font-size: 12px; color: #6b7280; line-height: 1.8; }
              .help-link { color: #ea580c; text-decoration: none; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>💬 New Message</h1>
                <p>Someone wants to talk about your listing</p>
              </div>

              <div class="content">
                <p class="greeting">Hi ${toName},</p>

                <p style="color: #4b5563; margin-bottom: 20px;">
                  You have a new message from a buyer on Haat Nepal!
                </p>

                <div class="listing-info">
                  <p class="listing-title">${listingTitle}</p>
                  <p class="sender-info"><strong>From:</strong> ${fromName}</p>
                  <p class="sender-info" style="font-size: 12px; color: #6b7280;">
                    ${fromEmail}
                  </p>
                </div>

                <div class="message-section">
                  <p class="message-label">Message:</p>
                  <p class="message-body">${messageBody}</p>
                </div>

                <div style="text-align: center;">
                  <a href="${conversationUrl}" class="cta-button">View Conversation</a>
                </div>

                <div class="reply-note">
                  <strong>💡 Quick tip:</strong> You can reply directly to this email, and your reply will go straight back to ${fromName}!
                </div>

                <div class="divider"></div>

                <p style="font-size: 14px; color: #4b5563;">
                  Keep your conversations safe — never share personal bank details or passwords. Use Haat Nepal's secure messaging for all communication.
                </p>
              </div>

              <div class="footer">
                <p class="footer-text">
                  <strong>Haat Nepal</strong><br>
                  Nepal's marketplace for buying, selling, and negotiating locally<br><br>
                  © 2026 Haat Nepal. All rights reserved.<br>
                  <a href="https://haatnepal.com" class="help-link">Visit our website</a>
                </p>
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
      return { success: false, error: "Failed to send message notification email" };
    }

    console.log("[EMAIL] New message notification sent to:", toEmail);
    return { success: true };
  } catch (error) {
    console.error("[EMAIL] Error sending message notification email:", error);
    return { success: false, error: "Error sending email" };
  }
}
