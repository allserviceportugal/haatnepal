-- haatnepal: Real Estate overhaul — Nepali land units, location hierarchy,
-- listing accountability, contact gating, and user-generated content (comments,
-- reviews).

-- =========================================================================
-- PART 1: Location hierarchy + province tracking
-- =========================================================================

alter table public.listings
  add column province text,
  add column municipality text,
  add column ward_number smallint,
  add column tole text;

alter table public.profiles
  add column province text;

-- Backfill profiles.province from the district (we'll derive it from a
-- hardcoded mapping — must match src/lib/constants/locations.ts exactly).
-- For now, mark all as NULL; the app will populate on next profile edit.
-- This avoids the problem of not knowing the exact district→province mapping
-- in SQL without hardcoding all 77 districts and their provinces.

-- =========================================================================
-- PART 2: Land area & price fields (Nepali traditional units + sqft/sqm)
-- =========================================================================

alter table public.listings
  add column land_unit_system text check (land_unit_system in ('ropani_system', 'bigha_system', 'sqft', 'sqm')),
  add column land_ropani integer,
  add column land_aana integer,
  add column land_paisa integer,
  add column land_daam integer,
  add column land_bigha integer,
  add column land_kattha integer,
  add column land_dhur integer,
  add column land_area_sqft numeric;

-- =========================================================================
-- PART 3: Listing accountability + ad expiry by plan
-- =========================================================================

alter table public.listings
  add column listing_number bigint not null generated always as identity,
  add column view_count integer not null default 0;

-- Index on listing_number for direct lookups (public reference)
create index listings_listing_number_idx on public.listings (listing_number);

-- Ad expiry driven by subscription plan
alter table public.subscription_plans
  add column listing_duration_days integer;

-- Set durations: normal/business = 30 days, plus = 60 days, pro = 90 days, custom = null (unlimited)
update public.subscription_plans set listing_duration_days = 30 where key in ('normal', 'business');
update public.subscription_plans set listing_duration_days = 60 where key = 'plus';
update public.subscription_plans set listing_duration_days = 90 where key = 'pro';
-- custom stays NULL (unlimited)

-- =========================================================================
-- PART 4: Contact gating infrastructure
-- =========================================================================

alter table public.profiles
  add column email text;

-- Backfill email from Supabase Auth's email. The handle_new_user trigger
-- already reads new.email; we just need to populate existing rows.
-- For the real-time migration, the app's updateProfileAction will ensure
-- email stays in sync on profile updates; for auth signup, the trigger
-- (updated separately, below) will set it. For now, leave existing rows
-- as NULL; they'll fill in on next login/update.

-- =========================================================================
-- PART 5: Public comments on listings
-- =========================================================================

create table public.listing_comments (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 2000),
  created_at timestamptz not null default now()
);

alter table public.listing_comments enable row level security;

create policy "Listing comments are publicly readable"
  on public.listing_comments for select
  using (true);

create policy "Authenticated users can add comments"
  on public.listing_comments for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create index listing_comments_listing_id_idx on public.listing_comments (listing_id);

-- =========================================================================
-- PART 6: Seller reviews (1-5 star + text, one per reviewer/reviewee pair)
-- =========================================================================

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating >= 1 and rating <= 5),
  body text check (body is null or (char_length(body) >= 1 and char_length(body) <= 1000)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (reviewee_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "Reviews are publicly readable"
  on public.reviews for select
  using (true);

create policy "Authenticated users can add reviews (not self)"
  on public.reviews for insert
  with check (
    auth.role() = 'authenticated'
    and auth.uid() = reviewer_id
    and reviewer_id != reviewee_id
  );

create policy "Reviewers can update their own reviews"
  on public.reviews for update
  using (
    auth.role() = 'authenticated'
    and auth.uid() = reviewer_id
    and reviewer_id != reviewee_id
  );

create index reviews_reviewee_id_idx on public.reviews (reviewee_id);

-- =========================================================================
-- PART 7: Real-estate-specific category attributes (land, house details)
-- =========================================================================

-- Land for Sale / Land for Rent attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('road_access', 'Road access', 'boolean', null, false, 1),
  ('road_width_ft', 'Road width (feet)', 'number', null, false, 2),
  ('land_purpose', 'Land purpose', 'select', '["Residential/Buildable", "Agricultural", "Tourism/Commercial", "Other"]', false, 3),
  ('land_purpose_notes', 'Land purpose notes', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('land-for-sale', 'land-for-rent');

-- House for Sale / House for Rent / Popular Property Types attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('house_type', 'House type', 'select', '["Detached Houses", "Holiday Homes", "Row Houses", "Semi-Detached Houses", "Bungalow", "Terraced", "Country Homes", "Ruins", "Luxury"]', false, 1),
  ('floors', 'Number of floors', 'number', null, false, 2),
  ('floor_area_sqft', 'Floor area (sqft)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('houses-for-sale', 'houses-for-rent', 'row-houses', 'semi-detached-houses', 'detached-houses', 'holiday-homes');

-- Apartment-specific attributes (elevator, balcony)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('elevator', 'Elevator', 'boolean', null, false, 1),
  ('balcony', 'Balcony', 'boolean', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('apartments-for-sale', 'apartments-for-rent');

-- Department-level Real Estate fallback attributes (year built, parking, facing, water)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'real-estate'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('year_built', 'Year built', 'number', null, false, 1),
  ('parking', 'Parking', 'select', '["None", "Street", "Covered", "Garage"]', false, 2),
  ('facing_direction', 'Facing direction', 'select', '["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"]', false, 3),
  ('water_source', 'Water source', 'select', '["Municipal", "Borewell", "Well", "Tanker"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
