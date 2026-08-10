-- haatnepal: Agriculture listings table extensions
-- Adds 7 new columns to support agriculture-specific listing features:
-- harvest date, unit-of-sale, minimum order quantity, farm location, rental flags
-- Matches the pattern from 0026_food_listings_extended.sql exactly

alter table public.listings
  add column is_agriculture boolean not null default false,
  add column harvest_date date,
  add column unit_of_sale text,
  add column min_order_quantity numeric(12, 2),
  add column farm_location text,
  add column for_rent boolean not null default false,
  add column rental_rate_period text;  -- 'hourly' | 'daily' | 'weekly' | 'monthly'

-- Create partial indexes for faster agriculture-specific queries
create index listings_is_agriculture_idx on public.listings (is_agriculture) where is_agriculture = true;
create index listings_harvest_date_idx on public.listings (harvest_date) where is_agriculture = true;
create index listings_for_rent_idx on public.listings (for_rent) where for_rent = true;
