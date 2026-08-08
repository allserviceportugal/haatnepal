-- Plus subscription tier + featured-listings mechanic.
--
-- NOTE: this file must be applied WITHOUT wrapping it in a single
-- transaction (no `psql -1`). `ALTER TYPE ... ADD VALUE` cannot be used in
-- the same transaction as a statement that references the new value, so the
-- enum addition below needs to commit on its own before the INSERT further
-- down runs. Plain `psql -f` autocommits each top-level statement, which is
-- exactly what we want here.

-- ---------------------------------------------------------------------------
-- subscription_tier: add 'plus', between 'business' and 'pro' in the ladder.
-- ---------------------------------------------------------------------------
alter type public.subscription_tier add value 'plus';

-- ---------------------------------------------------------------------------
-- subscription_plans: featured-listing allowance per plan (null = unlimited,
-- 0 = not included), plus the new Plus tier row.
-- ---------------------------------------------------------------------------
alter table public.subscription_plans
  add column monthly_featured_quota integer;

update public.subscription_plans set monthly_featured_quota = 0 where key = 'normal';
update public.subscription_plans set monthly_featured_quota = 0 where key = 'business';
update public.subscription_plans set monthly_featured_quota = 10 where key = 'pro';
update public.subscription_plans set monthly_featured_quota = null where key = 'custom';

update public.subscription_plans
  set description = 'For power sellers who want their listings seen first — unlimited listings, promoted placement, a branded storefront, and 10 featured boosts a month.'
  where key = 'pro';

update public.subscription_plans
  set description = 'For dealerships and large sellers — everything in Pro with no limits, negotiated pricing, and dedicated support.'
  where key = 'custom';

insert into public.subscription_plans
  (key, name, monthly_listing_quota, allows_promoted_listings, allows_storefront_branding, is_paid, price_npr, description, monthly_featured_quota)
values
  ('plus', 'Plus', 100, false, false, true, 499,
   'For active sellers who outgrew the free plans — 100 listings a month plus 3 featured boosts to get noticed.', 3);

-- ---------------------------------------------------------------------------
-- listings: featuring window
-- ---------------------------------------------------------------------------
alter table public.listings
  add column featured_at timestamptz,
  add column featured_until timestamptz;

create index listings_featured_until_idx on public.listings (featured_until);
