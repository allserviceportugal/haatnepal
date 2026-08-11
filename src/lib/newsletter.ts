const RESEND_API_KEY = process.env.RESEND_API_KEY;

interface NewsletterEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: "blog" | "top_seller" | "featured" | "weekly_digest";
}

export async function sendNewsletterEmail({
  to,
  subject,
  html,
  type,
}: NewsletterEmailOptions) {
  if (!RESEND_API_KEY) {
    console.error("[NEWSLETTER] RESEND_API_KEY not configured");
    return false;
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "newsletter@noreply.haatnepal.com",
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[NEWSLETTER] Resend API error:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("[NEWSLETTER] Error sending email:", error);
    return false;
  }
}

export function createBlogNewsletterEmail(
  blogTitle: string,
  blogExcerpt: string,
  blogUrl: string,
  category: string,
  author: string
): string {
  return `
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
        .blog-card { border-left: 4px solid #ea580c; padding-left: 20px; margin: 20px 0; }
        .blog-card h2 { margin: 0 0 10px 0; color: #1f2937; }
        .category { display: inline-block; background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin: 10px 0; }
        .cta-button { display: inline-block; background: #ea580c; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .cta-button:hover { background: #f97316; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .unsubscribe { text-align: center; margin-top: 20px; font-size: 12px; }
        .unsubscribe a { color: #ea580c; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📝 New Blog Post</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">From Haat Nepal Blog</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We just published a new article on our blog that you might find interesting:</p>

          <div class="blog-card">
            <div class="category">${category}</div>
            <h2>${blogTitle}</h2>
            <p>${blogExcerpt}</p>
            <p style="font-size: 12px; color: #6b7280;">By ${author}</p>
            <a href="${blogUrl}" class="cta-button">Read Full Article</a>
          </div>

          <p>Stay tuned for more articles on selling tips, shopping guides, and marketplace news!</p>

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
}

export function createWeeklyDigestEmail(
  topArticles: Array<{ title: string; url: string; category: string }>,
  featuredListings: Array<{ title: string; price: string; url: string }>,
  topSeller: { name: string; earnings: string; url: string }
): string {
  return `
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
        .section { margin: 30px 0; }
        .section-title { font-size: 18px; font-weight: 700; color: #1f2937; border-bottom: 2px solid #ea580c; padding-bottom: 10px; margin-bottom: 15px; }
        .article-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
        .article-item:last-child { border-bottom: none; }
        .article-item a { color: #ea580c; text-decoration: none; font-weight: 600; }
        .category-badge { display: inline-block; background: #f3f4f6; color: #4b5563; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px; }
        .featured-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 15px; border-radius: 8px; margin: 10px 0; }
        .featured-card .title { font-weight: 600; margin: 0; }
        .featured-card .price { color: #ea580c; font-weight: 700; font-size: 16px; margin: 5px 0; }
        .cta-button { display: inline-block; background: #ea580c; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; }
        .footer { text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .unsubscribe { text-align: center; margin-top: 20px; font-size: 12px; }
        .unsubscribe a { color: #ea580c; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Weekly Digest</h1>
          <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Your Haat Nepal Update</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Here's what happened on Haat Nepal this week:</p>

          <div class="section">
            <div class="section-title">📝 Top Articles This Week</div>
            ${topArticles
              .map(
                (article) =>
                  `<div class="article-item"><a href="${article.url}">${article.title}</a><span class="category-badge">${article.category}</span></div>`
              )
              .join("")}
          </div>

          <div class="section">
            <div class="section-title">⭐ Featured Listings</div>
            ${featuredListings
              .map(
                (listing) =>
                  `<div class="featured-card">
                  <p class="title">${listing.title}</p>
                  <p class="price">NPR ${listing.price}</p>
                  <a href="${listing.url}" class="cta-button">View Listing</a>
                </div>`
              )
              .join("")}
          </div>

          <div class="section">
            <div class="section-title">🏆 Top Seller of the Week</div>
            <div class="featured-card">
              <p class="title">${topSeller.name}</p>
              <p>Earnings this week: <strong>${topSeller.earnings}</strong></p>
              <a href="${topSeller.url}" class="cta-button">View Profile</a>
            </div>
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
}
