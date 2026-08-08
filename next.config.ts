import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// Enables Cloudflare bindings (KV/R2/D1/etc., not currently used but wired
// up for later) when running the plain `next dev` server locally.
initOpenNextCloudflareForDev();
