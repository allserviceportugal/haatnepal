import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createBlogNewsletterEmail } from "@/lib/newsletter";
import { verifyAdminApiKey, createUnauthorizedResponse, checkRateLimit, createRateLimitedResponse, sanitizeInput } from "@/lib/api-security";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface BlogNotificationRequest {
  blogId: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  blogUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin API key
    if (!verifyAdminApiKey(request)) {
      return createUnauthorizedResponse();
    }

    // Rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`blog-newsletter-${clientIp}`, 5, 3600000)) {
      return createRateLimitedResponse();
    }

    const body: BlogNotificationRequest = await request.json();

    if (!body.title || !body.excerpt || !body.blogUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!RESEND_API_KEY) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const supabase = await createClient();

    // Get all active subscribers interested in blogs
    const { data: subscribers, error: fetchError } = await supabase
      .from("newsletter_subscribers")
      .select("id, email")
      .eq("active", true)
      .contains("categories", ["blogs"]);

    if (fetchError) throw fetchError;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribers",
        count: 0,
      });
    }

    // Generate email content
    const emailHtml = createBlogNewsletterEmail(
      body.title,
      body.excerpt,
      body.blogUrl,
      body.category,
      body.author
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
            subject: `New Blog: ${body.title}`,
            html: emailHtml,
          }),
        });

        if (response.ok) {
          // Log successful send
          await supabase.from("newsletter_logs").insert([
            {
              subscriber_id: subscriber.id,
              email_type: "blog",
              subject: `New Blog: ${body.title}`,
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
      message: "Blog newsletter sent",
      sent: sentCount,
      failed: failedCount,
      total: subscribers.length,
    });
  } catch (error) {
    console.error("[BLOG NEWSLETTER] Error:", error);
    return NextResponse.json(
      { error: "Failed to send newsletter", success: false },
      { status: 500 }
    );
  }
}
