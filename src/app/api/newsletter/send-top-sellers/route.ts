import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyAdminApiKey, createUnauthorizedResponse, checkRateLimit, createRateLimitedResponse } from "@/lib/api-security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface TopSeller {
  name: string;
  category: string;
  earnings: string;
  rating: string;
  url: string;
}

interface TopSellersRequest {
  sellers: TopSeller[];
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    if (!verifyAdminApiKey(request)) {
      return createUnauthorizedResponse();
    }

    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`top-sellers-${clientIp}`, 10, 3600000)) {
      return createRateLimitedResponse();
    }

    const body: TopSellersRequest = await request.json();

    if (!body.sellers || body.sellers.length === 0) {
      return NextResponse.json({ error: "No sellers provided" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Get all active subscribers interested in top sellers
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("active", true)
      .contains("categories", ["top_sellers"]);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers",
        count: 0,
      });
    }

    // Generate seller cards
    const sellerCards = body.sellers
      .map(
        (seller) =>
          `<div style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ea580c;">
          <h3 style="margin: 0 0 10px 0; font-size: 16px; font-weight: 700; color: #1f2937;">${seller.name}</h3>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Category:</strong> ${seller.category}</p>
          <p style="margin: 5px 0; color: #ea580c;"><strong>Weekly Earnings:</strong> ${seller.earnings}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Rating:</strong> ${seller.rating}</p>
          <a href="${seller.url}" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 10px;">View Store</a>
        </div>`
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ea580c, #f97316); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { background: white; border: 1px solid #e5e7eb; border-radius: 0 0 8px 8px; padding: 30px; }
          .tip-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          .unsubscribe { text-align: center; margin-top: 20px; font-size: 12px; }
          .unsubscribe a { color: #ea580c; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Top Sellers This Week</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Success Stories & Top Performers</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Meet the top-performing sellers on Haat Nepal this week. They've mastered the art of selling - learn their strategies!</p>

            <div class="tip-box">
              <strong>💡 Learn from the best:</strong> Visit their stores to see how they photograph products, write descriptions, and interact with customers.
            </div>

            ${sellerCards}

            <div class="tip-box">
              <strong>🚀 Want to join the top sellers?</strong> Check out our <a href="https://haatnepal.com/blog/seller-monthly-income" style="color: #ea580c; text-decoration: none;">guide on top sellers' strategies</a> to learn their secrets!
            </div>

            <div class="footer">
              <p>© 2026 Haat Nepal. All rights reserved.</p>
              <p>Nepal's marketplace for buying, selling, and discovery.</p>
            </div>

            <div class="unsubscribe">
              <p><a href="https://haatnepal.com/newsletter/unsubscribe">Unsubscribe from newsletter</a></p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send emails to all subscribers
    let sentCount = 0;
    let failedCount = 0;

    for (const subscriber of subscribers) {
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "newsletter@noreply.haatnepal.com",
            to: subscriber.email,
            subject: "🏆 Top Sellers This Week - Learn Their Secrets!",
            html: emailHtml,
          }),
        });

        if (response.ok) {
          await supabase.from("newsletter_logs").insert([
            {
              subscriber_id: subscriber.id,
              email_type: "top_seller",
              subject: "Top Sellers",
              status: "sent",
            },
          ]);
          sentCount++;
        } else {
          failedCount++;
        }
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Top sellers email sent",
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[TOP SELLERS] Error:", error);
    return NextResponse.json(
      { error: "Failed to send top sellers email", success: false },
      { status: 500 }
    );
  }
}
