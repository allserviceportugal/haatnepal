-- haatnepal: Admin role system and moderation infrastructure
-- Adds admin/moderator role support and fixes the broken listing_reports RLS policy

-- =========================================================================
-- 1. ADMIN ROLE ENUM AND COLUMN
-- =========================================================================

create type public.user_role as enum ('user', 'admin', 'moderator');

alter table public.profiles
  add column if not exists role public.user_role not null default 'user';

-- Index for querying admins (rare, but useful for admin dashboards)
create index if not exists profiles_role_idx on public.profiles(role) where role != 'user';

-- =========================================================================
-- 2. FIX LISTING_REPORTS RLS - Was stubbed with using(false), now functional
-- =========================================================================

-- Drop the broken policy that was blocking all updates
drop policy if exists "Admins can update listing reports" on public.listing_reports;

-- Create the real admin update policy
create policy "Admins can update listing reports"
  on public.listing_reports for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (true);

-- Add select policy for admins to view reports
drop policy if exists "Admins can view listing reports" on public.listing_reports;
create policy "Admins can view listing reports"
  on public.listing_reports for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- =========================================================================
-- 3. ADMIN POLICY FOR LISTING UPDATES - Enable status/feature changes
-- =========================================================================

create policy "Admins can update any listing"
  on public.listings for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  )
  with check (true);

create policy "Admins can view all listings"
  on public.listings for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  ) or status in ('active', 'sold', 'expired') or true;  -- Admins see everything

-- =========================================================================
-- 4. HELPER FUNCTION - Check if user is admin
-- =========================================================================

create or replace function public.is_admin(p_user_id uuid)
returns boolean as $$
  select exists(
    select 1 from public.profiles
    where id = p_user_id and role = 'admin'
  );
$$ language sql stable security definer;

grant execute on function public.is_admin(uuid) to anon, authenticated;

-- =========================================================================
-- 5. LISTING ADMIN LOGS - Optional: track admin actions on listings
-- =========================================================================

create table if not exists public.listing_admin_logs (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  admin_id uuid not null references public.profiles(id),
  action text not null,  -- 'status_change', 'feature', 'suspend', 'restore', etc.
  old_value text,
  new_value text,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists listing_admin_logs_listing_id_idx on public.listing_admin_logs(listing_id);
create index if not exists listing_admin_logs_admin_id_idx on public.listing_admin_logs(admin_id);
create index if not exists listing_admin_logs_created_at_idx on public.listing_admin_logs(created_at desc);

alter table public.listing_admin_logs enable row level security;

create policy "Admins can view admin logs"
  on public.listing_admin_logs for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "Admins can insert admin logs"
  on public.listing_admin_logs for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );
