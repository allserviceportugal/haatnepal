-- haatnepal: Add listing reports table for issue reporting
-- Stores user reports of problematic listings

create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid references public.profiles (id) on delete set null,
  issue_type text not null check (issue_type in (
    'inappropriate-content', 'fake-listing', 'spam', 'scam',
    'harassment', 'illegal', 'other'
  )),
  message text not null,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'resolved', 'dismissed')),
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_reports_listing_id_idx on public.listing_reports (listing_id);
create index if not exists listing_reports_reporter_id_idx on public.listing_reports (reporter_id);
create index if not exists listing_reports_status_idx on public.listing_reports (status);
create index if not exists listing_reports_created_at_idx on public.listing_reports (created_at);

alter table public.listing_reports enable row level security;

-- Anyone can view reports (for transparency)
create policy "Listing reports are publicly readable"
  on public.listing_reports for select
  using (true);

-- Authenticated users can create reports
create policy "Users can create listing reports"
  on public.listing_reports for insert
  with check (auth.role() = 'authenticated');

-- Only admins can update reports
create policy "Admins can update listing reports"
  on public.listing_reports for update
  using (false) -- TODO: Add admin role check when implemented
  with check (false);
