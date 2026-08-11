"use server";

import { createClient } from "@/lib/supabase/server";

type ReportState = {
  success?: boolean;
  error?: string;
};

export async function reportListingIssueAction(
  _prevState: ReportState,
  formData: FormData
): Promise<ReportState> {
  try {
    const listingId = formData.get("listingId") as string;
    const listingTitle = formData.get("listingTitle") as string;
    const sellerName = formData.get("sellerName") as string;
    const issueType = formData.get("issueType") as string;
    const message = formData.get("message") as string;

    if (!listingId || !message.trim()) {
      return { error: "Please provide details about the issue." };
    }

    // Get current user info if logged in
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Create email content
    const emailContent = `
New Listing Report

Listing ID: ${listingId}
Listing Title: ${listingTitle}
Seller: ${sellerName}
Issue Type: ${issueType}

Reporter: ${user?.email || "Anonymous"}

Details:
${message}

---
Report submitted at: ${new Date().toISOString()}
Listing URL: https://haatnepal.com/listing/${listingId}
    `.trim();

    // Send email using Resend API
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not set");
      return { error: "Email service is not configured. Please try again later." };
    }

    const htmlContent = `
      <h2>New Listing Report</h2>
      <p><strong>Listing:</strong> ${listingTitle}</p>
      <p><strong>ID:</strong> ${listingId}</p>
      <p><strong>Seller:</strong> ${sellerName}</p>
      <p><strong>Issue Type:</strong> ${issueType.replace(/-/g, " ")}</p>
      <p><strong>Reporter:</strong> ${user?.email || "Anonymous"}</p>
      <h3>Details:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p><small>Submitted: ${new Date().toISOString()}</small></p>
      <p><a href="https://haatnepal.pages.dev/listing/${listingId}">View Listing</a></p>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "support@noreply.haatnepal.com",
        to: "hello@haatnepal.com",
        subject: `[REPORT] ${issueType.replace(/-/g, " ")} - ${listingTitle}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Resend API error:", errorData);
      return { error: "Failed to send report. Please try again later." };
    }

    // Optionally: Save report to database
    await supabase.from("listing_reports").insert({
      listing_id: listingId,
      reporter_id: user?.id,
      issue_type: issueType,
      message: message,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending report:", error);
    return {
      error: "Failed to send report. Please try again later.",
    };
  }
}
