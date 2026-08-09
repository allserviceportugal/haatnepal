-- haatnepal: extend listings table with food-specific columns
-- Supports expiry dates, storage, ingredients, allergen info for food products

alter table public.listings
add column food_freshness text,
add column best_before_date date,
add column manufacturing_date date,
add column ingredients text,
add column storage_instructions text,
add column allergen_info text,
add column is_food boolean not null default false;

-- Create index for expired food products (for filtering/expiry handling)
create index listings_best_before_date_idx on public.listings (best_before_date) where is_food = true;
create index listings_food_freshness_idx on public.listings (food_freshness) where is_food = true;
