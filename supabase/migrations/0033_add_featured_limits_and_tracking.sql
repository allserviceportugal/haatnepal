-- haatnepal: Add featured listing limits and monthly usage tracking
-- Implements subscription-based limits with notifications

-- =========================================================================
-- ADD FEATURED LISTING QUOTA TO SUBSCRIPTION PLANS
-- =========================================================================
alter table public.subscription_plans
add column if not exists monthly_featured_quota integer default 0; -- 0 = not allowed, null = unlimited

-- Update existing plans with featured listing limits
update public.subscription_plans set monthly_featured_quota = 0 where key = 'normal';
update public.subscription_plans set monthly_featured_quota = 0 where key = 'business';
update public.subscription_plans set monthly_featured_quota = null where key = 'pro'; -- unlimited
update public.subscription_plans set monthly_featured_quota = null where key = 'custom'; -- unlimited

-- =========================================================================
-- CREATE MONTHLY USAGE TRACKING TABLE
-- =========================================================================
create table if not exists public.user_monthly_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  month_year date not null, -- First day of the month (e.g., 2026-08-01)
  listings_created integer not null default 0,
  featured_listings_created integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, month_year)
);

create index if not exists user_monthly_usage_user_id_idx on public.user_monthly_usage (user_id);
create index if not exists user_monthly_usage_month_year_idx on public.user_monthly_usage (month_year);

alter table public.user_monthly_usage enable row level security;

create policy "Users can view their own usage"
  on public.user_monthly_usage for select
  using (user_id = auth.uid());

create policy "Users can update their own usage"
  on public.user_monthly_usage for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =========================================================================
-- HELPER FUNCTION: GET CURRENT MONTH USAGE
-- =========================================================================
create or replace function public.get_user_monthly_usage(user_id uuid)
returns table(
  listings_created integer,
  featured_listings_created integer,
  listing_limit integer,
  featured_limit integer,
  listings_remaining integer,
  featured_remaining integer
) as $$
declare
  current_month date;
  usage_record record;
  plan_record record;
begin
  current_month := date_trunc('month', now())::date;

  -- Get or create usage record for this month
  insert into user_monthly_usage (user_id, month_year)
  values (user_id, current_month)
  on conflict (user_id, month_year) do nothing;

  -- Get current month's usage
  select listings_created, featured_listings_created into usage_record
  from user_monthly_usage
  where user_id = get_user_monthly_usage.user_id
    and month_year = current_month;

  -- Get subscription plan limits
  select sp.monthly_listing_quota, sp.monthly_featured_quota into plan_record
  from profiles p
  join subscription_plans sp on p.subscription_plan_id = sp.id
  where p.id = get_user_monthly_usage.user_id;

  -- Calculate remaining (null quota = unlimited, -1 = unlimited)
  listings_created := coalesce(usage_record.listings_created, 0);
  featured_listings_created := coalesce(usage_record.featured_listings_created, 0);
  listing_limit := coalesce(plan_record.monthly_listing_quota, -1);
  featured_limit := coalesce(plan_record.monthly_featured_quota, -1);

  if listing_limit = -1 then
    listings_remaining := -1;
  else
    listings_remaining := greatest(0, listing_limit - listings_created);
  end if;

  if featured_limit = -1 then
    featured_remaining := -1;
  else
    featured_remaining := greatest(0, featured_limit - featured_listings_created);
  end if;

  return next;
end;
$$ language plpgsql;

-- =========================================================================
-- HELPER FUNCTION: INCREMENT USAGE (called after listing/feature creation)
-- =========================================================================
create or replace function public.increment_user_usage(
  user_id uuid,
  is_featured boolean default false
)
returns void as $$
declare
  current_month date;
begin
  current_month := date_trunc('month', now())::date;

  insert into user_monthly_usage (user_id, month_year, listings_created, featured_listings_created)
  values (user_id, current_month, 1, case when is_featured then 1 else 0 end)
  on conflict (user_id, month_year)
  do update set
    listings_created = user_monthly_usage.listings_created + 1,
    featured_listings_created = user_monthly_usage.featured_listings_created + (case when is_featured then 1 else 0 end),
    updated_at = now();
end;
$$ language plpgsql;

-- =========================================================================
-- HELPER FUNCTION: CHECK IF USER CAN CREATE LISTING
-- =========================================================================
create or replace function public.can_user_create_listing(user_id uuid)
returns table(can_create boolean, reason text, limit_reached boolean) as $$
declare
  usage record;
begin
  select * into usage from get_user_monthly_usage(user_id);

  -- Check if limit reached
  if usage.listing_limit != -1 and usage.listings_created >= usage.listing_limit then
    return query select false, 'Monthly listing limit reached. Upgrade your plan to continue.', true;
  else
    return query select true, null, false;
  end if;
end;
$$ language plpgsql;

-- =========================================================================
-- HELPER FUNCTION: CHECK IF USER CAN FEATURE LISTING
-- =========================================================================
create or replace function public.can_user_feature_listing(user_id uuid)
returns table(can_feature boolean, reason text, limit_reached boolean) as $$
declare
  usage record;
begin
  select * into usage from get_user_monthly_usage(user_id);

  -- Check if featured listing is allowed
  if usage.featured_limit = 0 then
    return query select false, 'Your plan does not include featured listings. Upgrade to Pro or above.', true;
  end if;

  -- Check if featured limit reached
  if usage.featured_limit != -1 and usage.featured_listings_created >= usage.featured_limit then
    return query select false, 'Monthly featured listing limit reached. Upgrade your plan for more.', true;
  else
    return query select true, null, false;
  end if;
end;
$$ language plpgsql;
