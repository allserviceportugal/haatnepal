import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Main Pages
    {
      url: "https://haatnepal.com",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // Blog
    {
      url: "https://haatnepal.com/blog",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },

    // Blog Articles
    {
      url: "https://haatnepal.com/blog/buying-guide-smartphones",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/start-ecommerce-business",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/fashion-trends-august",
      lastModified: new Date("2026-08-10"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/safe-payment-methods",
      lastModified: new Date("2026-08-10"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/photography-tips-listings",
      lastModified: new Date("2026-08-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/real-estate-market-nepal",
      lastModified: new Date("2026-08-09"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/negotiate-like-pro",
      lastModified: new Date("2026-08-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://haatnepal.com/blog/seller-monthly-income",
      lastModified: new Date("2026-08-08"),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Categories
    {
      url: "https://haatnepal.com/c/vehicles",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://haatnepal.com/c/real-estate",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://haatnepal.com/c/electronics",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://haatnepal.com/c/fashion",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://haatnepal.com/c/jobs",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: "https://haatnepal.com/c/food-beverages",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "daily",
      priority: 0.8,
    },

    // Info Pages
    {
      url: "https://haatnepal.com/about",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://haatnepal.com/advertise",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://haatnepal.com/contact",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://haatnepal.com/faq",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Legal Pages
    {
      url: "https://haatnepal.com/terms",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://haatnepal.com/privacy",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: "https://haatnepal.com/buyer-protection",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: "https://haatnepal.com/returns-refunds",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: "https://haatnepal.com/shipping-delivery",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: "https://haatnepal.com/safety-guidelines",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: "https://haatnepal.com/seller-guidelines",
      lastModified: new Date("2026-08-11"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}

// Note: External partner links (cargosender.com, flightsinsight.com, voydly.com)
// are NOT included in sitemap as Google only allows URLs from your own domain.
// These are included as backlinks in the footer for SEO purposes instead.
