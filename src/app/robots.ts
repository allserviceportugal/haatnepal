import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/.well-known", "/dashboard", "/auth"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        crawlDelay: 0,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        crawlDelay: 1,
      },
      {
        userAgent: "MJ12bot",
        disallow: "/",
      },
      {
        userAgent: "AhrefsBot",
        disallow: "/",
      },
    ],
    sitemap: "https://haatnepal.com/sitemap.xml",
  };
}
