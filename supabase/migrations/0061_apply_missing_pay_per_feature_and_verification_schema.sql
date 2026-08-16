-- haatnepal: Apply schema that migrations 0050 and 0055 defined but was never
-- fully deployed to production (only the subscription_plans quota update from
-- 0050 and the verification-documents storage bucket from 0055 had landed).
-- This creates the missing tables/policies/function so the pay-per-feature
-- (NPR 44) and business verification flows actually work end to end.

-- =========================================================================
-- 1. listing_feature_purchases (from 0050)
-- =========================================================================

create table if not exists public.listing_feature_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount_npr numeric not null default 44,
  status text not null default 'completed' check (status in ('pending', 'completed', 'failed')),
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_feature_purchases_listing_id_idx on public.listing_feature_purchases (listing_id);
create index if not exists listing_feature_purchases_seller_id_idx on public.listing_feature_purchases (seller_id);
create index if not exists listing_feature_purchases_created_at_idx on public.listing_feature_purchases (created_at desc);

alter table public.listing_feature_purchases enable row level security;

drop policy if exists "Sellers can insert their own feature purchases" on public.listing_feature_purchases;
create policy "Sellers can insert their own feature purchases"
  on public.listing_feature_purchases for insert
  with check (seller_id = auth.uid());

drop policy if exists "Sellers can view their own feature purchases" on public.listing_feature_purchases;
create policy "Sellers can view their own feature purchases"
  on public.listing_feature_purchases for select
  using (seller_id = auth.uid());

drop policy if exists "Admins can view all feature purchases" on public.listing_feature_purchases;
create policy "Admins can view all feature purchases"
  on public.listing_feature_purchases for select
  using (
    (auth.uid() in (select id from public.profiles where role = 'admin'))
    or (auth.uid() in (select id from public.profiles where role = 'moderator'))
  );

create or replace function public.grant_admin_feature_boost(
  p_listing_id uuid,
  p_reason text default 'admin override'
) returns void as $$
declare
  v_seller_id uuid;
begin
  if (select role from public.profiles where id = auth.uid()) not in ('admin', 'moderator') then
    raise exception 'Only admins can grant feature boosts';
  end if;

  select seller_id into v_seller_id from public.listings where id = p_listing_id;
  if v_seller_id is null then
    raise exception 'Listing not found';
  end if;

  insert into public.listing_feature_purchases (listing_id, seller_id, amount_npr, status, payment_reference)
  values (p_listing_id, v_seller_id, 0, 'completed', 'admin:' || p_reason);
end;
$$ language plpgsql security definer;

-- =========================================================================
-- 2. business_verification_requests (from 0055)
-- =========================================================================

create table if not exists public.business_verification_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  requested_plan_key public.subscription_tier not null check (requested_plan_key in ('plus', 'pro', 'premium')),
  business_name text not null check (char_length(business_name) >= 1),
  contact_person_name text not null check (char_length(contact_person_name) >= 1),
  contact_email text not null,
  contact_phone text not null,
  business_address text not null check (char_length(business_address) >= 1),
  registration_certificate_path text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (status = 'rejected' or rejection_reason is null),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists business_verification_requests_user_pending_idx
  on public.business_verification_requests (user_id)
  where status = 'pending';

create index if not exists business_verification_requests_status_idx on public.business_verification_requests (status);
create index if not exists business_verification_requests_created_at_idx on public.business_verification_requests (created_at desc);

alter table public.business_verification_requests enable row level security;

drop policy if exists "Users can create their own verification requests" on public.business_verification_requests;
create policy "Users can create their own verification requests"
  on public.business_verification_requests for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

drop policy if exists "Users can see their own verification requests" on public.business_verification_requests;
create policy "Users can see their own verification requests"
  on public.business_verification_requests for select
  using (auth.role() = 'authenticated' and auth.uid() = user_id);

drop policy if exists "Admins can view all verification requests" on public.business_verification_requests;
create policy "Admins can view all verification requests"
  on public.business_verification_requests for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists "Admins can update verification requests" on public.business_verification_requests;
create policy "Admins can update verification requests"
  on public.business_verification_requests for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (true);

-- verification-documents storage bucket already exists in production; only
-- add it if some environment is missing it.
insert into storage.buckets (id, name, public)
values ('verification-documents', 'verification-documents', false)
on conflict (id) do nothing;

drop policy if exists "Users upload verification documents to their own folder" on storage.objects;
create policy "Users upload verification documents to their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users and admins can read verification documents" on storage.objects;
create policy "Users and admins can read verification documents"
  on storage.objects for select
  using (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (
      (storage.foldername(name))[1] = auth.uid()::text
      or exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
      )
    )
  );

drop policy if exists "Users delete their own verification documents" on storage.objects;
create policy "Users delete their own verification documents"
  on storage.objects for delete
  using (
    bucket_id = 'verification-documents'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
