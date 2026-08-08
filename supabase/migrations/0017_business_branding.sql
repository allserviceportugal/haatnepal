-- haatnepal: business storefront branding — logo, cover banner, and a short
-- description, shown on a business seller's public profile. Gated by the
-- subscription plan's allows_storefront_branding flag (Pro/Custom).

alter table public.profiles
  add column business_description text,
  add column logo_url text,
  add column cover_image_url text;
