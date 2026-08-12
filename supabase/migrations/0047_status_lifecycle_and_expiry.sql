-- haatnepal: Status lifecycle, expiry automation, seller stats, and analytics
-- Adds audit columns for status changes, pg_cron jobs for expiry and daily stats refresh,
-- and seller_stats table for response rate tracking

-- =========================================================================
-- 1. STATUS LIFECYCLE - Add new enum values to listing_status
-- =========================================================================

-- Note: These must run outside a transaction block
alter type public.listing_status add value 'pending' after 'draft';
alter type public.listing_status add value 'reserved' after 'active';
alter type public.listing_status add value 'rejected' after 'expired';
alter type public.listing_status add value 'suspended' after 'rejected';
alter type public.listing_status add value 'archived' after 'suspended';

-- =========================================================================
-- 2. AUDIT COLUMNS - Track status changes with who and why
-- =========================================================================

alter table public.listings
  add column if not exists status_changed_at timestamptz default now(),
  add column if not exists status_changed_by uuid references public.profiles(id),
  add column if not exists status_reason text;

-- Trigger to auto-update status_changed_at whenever status changes
create or replace function public.track_listing_status_change() returns trigger as $$
begin
  if new.status is distinct from old.status then
    new.status_changed_at = now();
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists listings_track_status_change on public.listings;
create trigger listings_track_status_change
  before update on public.listings
  for each row
  execute function public.track_listing_status_change();

-- =========================================================================
-- 3. SELLER_STATS - Precomputed daily stats for response rate and activity
-- =========================================================================

create table if not exists public.seller_stats (
  seller_id uuid primary key references public.profiles(id) on delete cascade,
  response_rate numeric(5, 2),                -- % of conversations with a reply
  avg_response_minutes integer,               -- average time to first reply
  active_listings_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.seller_stats enable row level security;

create policy "Seller stats are publicly readable"
  on public.seller_stats for select using (true);

create index if not exists seller_stats_updated_at_idx on public.seller_stats(updated_at);

-- =========================================================================
-- 4. EXPIRY AUTOMATION - Expire listings when expires_at passes
-- =========================================================================

create or replace function public.expire_listings() returns void as $$
begin
  update public.listings
  set status = 'expired', status_reason = 'auto: expired via pg_cron'
  where status in ('active', 'reserved')
    and expires_at is not null
    and expires_at < now();
end;
$$ language plpgsql;

-- Schedule expiry check every 15 minutes (requires pg_cron extension to be enabled)
-- This is idempotent: listings already in 'expired' status won't be touched
select cron.schedule(
  'expire-listings-every-15-min',
  '*/15 * * * *',
  $$select public.expire_listings();$$
) on conflict (jobname) do update set schedule = '*/15 * * * *';

-- =========================================================================
-- 5. ANALYTICS - Seller stats refresh (daily aggregation)
-- =========================================================================

create or replace function public.refresh_seller_stats() returns void as $$
begin
  -- Upsert seller stats with response rate, avg response time, and active listing count
  insert into public.seller_stats (seller_id, response_rate, avg_response_minutes, active_listings_count, updated_at)
  select
    profiles.id,
    -- Response rate: conversations where the seller has sent a message / total conversations
    (
      case
        when count(distinct c.id) = 0 then null
        else round(
          (count(distinct case when exists (
            select 1 from public.messages m
            where m.conversation_id = c.id and m.sender_id = profiles.id
          ) then c.id end) * 100.0) / count(distinct c.id),
          2
        )
      end
    ),
    -- Avg response time in minutes: time from conversation start to first seller reply
    (
      select round(avg(extract(epoch from (m.created_at - c.created_at)) / 60))::int
      from public.conversations c
      left join public.messages m on m.conversation_id = c.id and m.sender_id = profiles.id
      where c.seller_id = profiles.id
        and m.id = (
          select id from public.messages
          where conversation_id = c.id and sender_id = profiles.id
          order by created_at asc limit 1
        )
    ),
    -- Active listings count
    (
      select count(*) from public.listings
      where seller_id = profiles.id and status = 'active'
    ),
    now()
  from public.profiles
  left join public.conversations c on c.seller_id = profiles.id
  group by profiles.id
  on conflict (seller_id) do update set
    response_rate = excluded.response_rate,
    avg_response_minutes = excluded.avg_response_minutes,
    active_listings_count = excluded.active_listings_count,
    updated_at = excluded.updated_at;
end;
$$ language plpgsql;

-- Schedule seller stats refresh once daily at 2 AM UTC
select cron.schedule(
  'refresh-seller-stats-daily',
  '0 2 * * *',
  $$select public.refresh_seller_stats();$$
) on conflict (jobname) do update set schedule = '0 2 * * *';

-- =========================================================================
-- 6. ANALYTICS RPCs - Time-series views and performance summaries
-- =========================================================================

create or replace function public.get_listing_view_timeseries(
  p_listing_id uuid,
  p_days integer default null
)
returns table(view_date date, views bigint, unique_viewers bigint) as $$
  select
    view_date,
    count(*)::bigint as views,
    count(distinct viewer_key)::bigint as unique_viewers
  from public.listing_views
  where listing_id = p_listing_id
    and (p_days is null or view_date >= (current_date - (p_days || ' days')::interval)::date)
  group by view_date
  order by view_date desc;
$$ language sql stable;

create or replace function public.get_listing_performance_summary(p_listing_id uuid)
returns table(
  views_last_7d bigint,
  views_prior_7d bigint,
  favorites_last_7d bigint,
  favorites_prior_7d bigint,
  leads_last_7d bigint,
  leads_prior_7d bigint
) as $$
  select
    (select count(*) from public.listing_views where listing_id = p_listing_id and view_date >= (current_date - 7))::bigint,
    (select count(*) from public.listing_views where listing_id = p_listing_id and view_date >= (current_date - 14) and view_date < (current_date - 7))::bigint,
    (select count(*) from public.favorites where listing_id = p_listing_id and created_at >= now() - '7 days'::interval)::bigint,
    (select count(*) from public.favorites where listing_id = p_listing_id and created_at >= now() - '14 days'::interval and created_at < now() - '7 days'::interval)::bigint,
    (select count(*) from public.leads where listing_id = p_listing_id and created_at >= now() - '7 days'::interval)::bigint,
    (select count(*) from public.leads where listing_id = p_listing_id and created_at >= now() - '14 days'::interval and created_at < now() - '7 days'::interval)::bigint;
$$ language sql stable;
