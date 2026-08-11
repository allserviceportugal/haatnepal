import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface FeaturedListingsRequest {
  listings: Array<{ title: string; price: string; category: string; url: string; seller: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: FeaturedListingsRequest = await request.json();

    if (!body.listings || body.listings.length === 0) {
      return NextResponse.json({ error: "No listings provided" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Get all active subscribers interested in featured listings
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("active", true)
      .contains("categories", ["featured_listings"]);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers",
        count: 0,
      });
    }

    // Generate email content
    const listingCards = body.listings
      .map(
        (listing) =>
          `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; margin: 10px 0;">
          <p style="font-weight: 600; margin: 0;">${listing.title}</p>
          <p style="color: #ea580c; font-weight: 700; font-size: 16px; margin: 5px 0;">NPR ${listing.price}</p>
          <p style="font-size: 12px; color: #6b7280; margin: 5px 0;">Category: ${listing.category} | Seller: ${listing.seller}</p>
          <a href="${listing.url}" style="display: inline-block; background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 10px;">View Listing</a>
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
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
          .unsubscribe { text-align: center; margin-top: 20px; font-size: 12px; }
          .unsubscribe a { color: #ea580c; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⭐ Featured Listings</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Hot Deals This Week</p>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Check out these featured listings trending on Haat Nepal this week:</p>

            ${listingCards}

            <p style="margin-top: 20px; text-align: center;">
              <a href="https://haatnepal.com" style="display: inline-block; background: #ea580c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600;">Browse All Listings</a>
            </p>

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
            subject: "⭐ Featured Listings - Hot Deals This Week",
            html: emailHtml,
          }),
        });

        if (response.ok) {
          await supabase.from("newsletter_logs").insert([
            {
              subscriber_id: subscriber.id,
              email_type: "featured",
              subject: "Featured Listings",
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
      message: "Featured listings email sent",
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[FEATURED LISTINGS] Error:", error);
    return NextResponse.json(
      { error: "Failed to send featured listings", success: false },
      { status: 500 }
    );
  }
}
