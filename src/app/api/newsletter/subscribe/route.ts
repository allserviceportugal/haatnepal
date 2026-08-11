import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Already subscribed", success: false },
        { status: 400 }
      );
    }

    // Add subscriber
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .insert([
        {
          email,
          subscribed_at: new Date().toISOString(),
          active: true,
          categories: ["blogs", "top_sellers", "featured_listings", "weekly_digest"],
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Send welcome email
    if (RESEND_API_KEY) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "newsletter@noreply.haatnepal.com",
          to: email,
          subject: "Welcome to Haat Nepal Newsletter! 🎉",
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
                .feature-list { list-style: none; padding: 0; margin: 20px 0; }
                .feature-list li { padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
                .feature-list li:before { content: "✓ "; color: #10b981; font-weight: bold; margin-right: 8px; }
                .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to Haat Nepal Newsletter!</h1>
                </div>
                <div class="content">
                  <p>Hello,</p>
                  <p>Thank you for subscribing to the Haat Nepal Newsletter! You're now part of our community of smart buyers and successful sellers.</p>

                  <h3>What You'll Receive:</h3>
                  <ul class="feature-list">
                    <li>📝 Latest blog posts and marketplace tips</li>
                    <li>⭐ Top sellers' success stories and strategies</li>
                    <li>🌟 Featured listings and trending products</li>
                    <li>📊 Weekly digest with market insights</li>
                    <li>💡 Exclusive shopping and selling tips</li>
                    <li>🔔 Important marketplace updates</li>
                  </ul>

                  <p>We respect your time and send high-quality content only. You can unsubscribe anytime from any email footer.</p>

                  <div class="footer">
                    <p>© 2026 Haat Nepal. All rights reserved.</p>
                    <p>Nepal's marketplace for buying, selling, and discovery.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data,
    });
  } catch (error) {
    console.error("[NEWSLETTER] Error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe", success: false },
      { status: 500 }
    );
  }
}
