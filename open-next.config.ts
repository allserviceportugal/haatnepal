import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No R2 incremental cache configured yet (would need an R2 bucket set up in
// the Cloudflare dashboard first) — ISR/SSG caching falls back to in-memory,
// fine for now since most pages here are dynamically rendered anyway
// (auth-aware via cookies).
export default defineCloudflareConfig();
