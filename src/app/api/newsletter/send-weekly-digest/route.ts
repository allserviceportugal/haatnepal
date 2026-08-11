import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createWeeklyDigestEmail } from "@/lib/newsletter";
import { verifyAdminApiKey, createUnauthorizedResponse, checkRateLimit, createRateLimitedResponse } from "@/lib/api-security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface WeeklyDigestRequest {
  topArticles: Array<{ title: string; url: string; category: string }>;
  featuredListings: Array<{ title: string; price: string; url: string }>;
  topSeller: { name: string; earnings: string; url: string };
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    if (!verifyAdminApiKey(request)) {
      return createUnauthorizedResponse();
    }

    // Rate limiting (max 2 per day)
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`weekly-digest-${clientIp}`, 2, 86400000)) {
      return createRateLimitedResponse();
    }

    const body: WeeklyDigestRequest = await request.json();

    if (!body.topArticles || !body.featuredListings || !body.topSeller) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Get all active subscribers interested in weekly digest
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("active", true)
      .contains("categories", ["weekly_digest"]);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers",
        count: 0,
      });
    }

    // Generate email content
    const emailHtml = createWeeklyDigestEmail(
      body.topArticles,
      body.featuredListings,
      body.topSeller
    );

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
            subject: "📊 Haat Nepal Weekly Digest",
            html: emailHtml,
          }),
        });

        if (response.ok) {
          // Log successful send
          await supabase.from("newsletter_logs").insert([
            {
              subscriber_id: subscriber.id,
              email_type: "weekly_digest",
              subject: "Weekly Digest",
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
      message: "Weekly digest sent",
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[WEEKLY DIGEST] Error:", error);
    return NextResponse.json(
      { error: "Failed to send digest", success: false },
      { status: 500 }
    );
  }
}
