-- haatnepal: Real view tracking, lead-type expansion, and metrics RPC fix
-- Implements the `listing_views` table that get_listing_lead_metrics() was already referencing
-- (that's why it was throwing), fixes dead CTA handlers, adds whatsapp/share tracking

-- =========================================================================
-- 1. LISTING_VIEWS TABLE - Core view-tracking mechanism
-- =========================================================================

create table public.listing_views (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  viewer_id uuid references public.profiles(id) on delete set null,

  -- Each viewer gets a unique key: profiles.id::text for logged-in users,
  -- anonymous cookie UUID for guests. Deduplication constraint uses this.
  viewer_key text not null,

  -- Record the date in Nepal time (UTC+5:45), not UTC, so a day granule
  -- matches what the user sees on their screen
  view_date date not null default ((now() at time zone 'Asia/Kathmandu')::date),
  created_at timestamptz not null default now(),

  -- Unique constraint: one view per (listing, day, viewer). This enables
  -- the idempotency pattern: repeat same-day views hit the constraint,
  -- trigger ON CONFLICT DO NOTHING, and produce zero DB writes.
  unique(listing_id, view_date, viewer_key)
);

create index listing_views_listing_id_idx on public.listing_views(listing_id);
create index listing_views_listing_id_date_idx on public.listing_views(listing_id, view_date desc);
create index listing_views_viewer_key_idx on public.listing_views(viewer_key);

alter table public.listing_views enable row level security;

-- Only sellers can read views on their own listings (same pattern as leads)
create policy "Sellers can view analytics on their listings"
  on public.listing_views for select
  using(
    exists(
      select 1 from public.listings l
      where l.id = listing_views.listing_id
        and l.seller_id = auth.uid()
    )
  );

-- =========================================================================
-- 2. LISTING_VIEWS - WRITE RPC (SECURITY DEFINER, NOT DIRECT INSERTS)
-- =========================================================================

create or replace function public.track_listing_view(
  p_listing_id uuid,
  p_viewer_id uuid default null,
  p_viewer_key text default null
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_seller_id uuid;
begin
  -- Look up the listing's seller
  select seller_id into v_seller_id
  from listings where id = p_listing_id;

  if v_seller_id is null then
    -- Listing doesn't exist; silently do nothing (the listing may have been deleted)
    return;
  end if;

  -- Exclude self-views: don't count if the viewer IS the seller
  if p_viewer_id = v_seller_id then
    return;
  end if;

  -- Insert (or ignore on conflict) the view; the unique constraint + ON CONFLICT
  -- pattern makes repeat same-day views a no-op unique-index probe with no write.
  insert into public.listing_views (listing_id, viewer_id, viewer_key)
  values (p_listing_id, p_viewer_id, coalesce(p_viewer_key, ''))
  on conflict (listing_id, view_date, viewer_key) do nothing;
end;
$$;

grant execute on function public.track_listing_view(uuid, uuid, text)
  to anon, authenticated;

-- =========================================================================
-- 3. LISTING_VIEWS - TRIGGER TO KEEP view_count IN SYNC
-- =========================================================================

create or replace function public.bump_listing_view_count() returns trigger as $$
begin
  -- Only increment for genuinely new rows (not for ON CONFLICT DO NOTHING skips).
  -- Postgres never fires AFTER INSERT row triggers for rows not actually inserted.
  update public.listings
  set view_count = view_count + 1
  where id = new.listing_id;

  return new;
end;
$$ language plpgsql;

-- Drop any existing version of this trigger first
drop trigger if exists listing_views_bump_count on public.listing_views;

create trigger listing_views_bump_count
  after insert on public.listing_views
  for each row
  execute function public.bump_listing_view_count();

-- =========================================================================
-- 4. LISTING_SHARE_COUNTS VIEW - Public-safe share count (like favorite_counts)
-- =========================================================================

create view public.listing_share_counts as
  select listing_id, count(*)::int as share_count
  from public.leads
  where lead_type = 'share_click'
  group by listing_id;

alter view public.listing_share_counts owner to postgres;
grant select on public.listing_share_counts to anon, authenticated;

-- =========================================================================
-- 5. EXPAND leads.lead_type CHECK CONSTRAINT - ADD WhatsApp, Share tracking
-- =========================================================================

-- Note: lead_type is a plain text column with a CHECK constraint, not a Postgres enum type.
-- Update the constraint to include the new lead types.
alter table public.leads drop constraint if exists leads_lead_type_check;
alter table public.leads add constraint leads_lead_type_check
  check (lead_type in (
    'contact_revealed', 'phone_click', 'email_click', 'whatsapp_click',
    'message_started', 'offer_made', 'favorite', 'share_click'
  ));

-- =========================================================================
-- 6. FIX get_listing_lead_metrics RPC - NOW QUERIES listing_views (which exists!)
-- =========================================================================

create or replace function public.get_listing_lead_metrics(p_listing_id uuid)
returns table(
  total_views bigint,
  unique_viewers bigint,
  contact_reveals bigint,
  phone_clicks bigint,
  whatsapp_clicks bigint,
  email_clicks bigint,
  messages bigint,
  offers bigint,
  favorites bigint,
  shares bigint
) language sql stable as $$
  select
    (select count(*)::bigint from listing_views where listing_id = p_listing_id),
    (select count(distinct viewer_key)::bigint from listing_views where listing_id = p_listing_id),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'contact_revealed'),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'phone_click'),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'whatsapp_click'),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'email_click'),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'message_started'),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'offer_made'),
    (select count(*)::bigint from favorites where listing_id = p_listing_id),
    (select count(*)::bigint from leads where listing_id = p_listing_id and lead_type = 'share_click');
$$;
