-- Pay-per-feature: NPR 44 per featured listing boost
-- Pro plan gets 20 free featured boosts/month; others can pay for individual boosts

-- ---------------------------------------------------------------------------
-- Update Pro plan: 20 free featured boosts per month (was unlimited)
-- ---------------------------------------------------------------------------
update public.subscription_plans set monthly_featured_quota = 20 where key = 'pro';

-- ---------------------------------------------------------------------------
-- listing_feature_purchases: Track paid feature boosts (NPR 44 each)
-- ---------------------------------------------------------------------------
create table if not exists public.listing_feature_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount_npr numeric not null default 44,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  payment_reference text, -- external payment gateway transaction ID (e.g., eSewa txn ref), populated when real payment is integrated
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_feature_purchases_listing_id_idx on public.listing_feature_purchases (listing_id);
create index if not exists listing_feature_purchases_seller_id_idx on public.listing_feature_purchases (seller_id);
create index if not exists listing_feature_purchases_created_at_idx on public.listing_feature_purchases (created_at desc);

-- ---------------------------------------------------------------------------
-- RLS: sellers can insert and view only their own purchase records
-- ---------------------------------------------------------------------------
alter table public.listing_feature_purchases enable row level security;

create policy "Sellers can insert their own feature purchases"
  on public.listing_feature_purchases for insert
  with check (seller_id = auth.uid());

create policy "Sellers can view their own feature purchases"
  on public.listing_feature_purchases for select
  using (seller_id = auth.uid());

create policy "Admins can view all feature purchases"
  on public.listing_feature_purchases for select
  using (
    (auth.uid() in (select id from public.profiles where role = 'admin'))
    or (auth.uid() in (select id from public.profiles where role = 'moderator'))
  );

-- ---------------------------------------------------------------------------
-- Function: Log admin purchase overrides (admins can grant free boosts)
-- ---------------------------------------------------------------------------
create or replace function public.grant_admin_feature_boost(
  p_listing_id uuid,
  p_reason text default 'admin override'
) returns void as $$
declare
  v_seller_id uuid;
begin
  -- Only admins can grant
  if (select role from public.profiles where id = auth.uid()) not in ('admin', 'moderator') then
    raise exception 'Only admins can grant feature boosts';
  end if;

  -- Get listing seller
  select seller_id into v_seller_id from public.listings where id = p_listing_id;
  if v_seller_id is null then
    raise exception 'Listing not found';
  end if;

  -- Record the grant as a completed purchase with reason in payment_reference
  insert into public.listing_feature_purchases (listing_id, seller_id, amount_npr, status, payment_reference)
  values (p_listing_id, v_seller_id, 0, 'completed', 'admin:' || p_reason);
end;
$$ language plpgsql security definer;

-- ---------------------------------------------------------------------------
-- Trigger: update listing featured status when purchase succeeds
-- (handled by application code in purchaseFeatureBoostAction)
-- ---------------------------------------------------------------------------
