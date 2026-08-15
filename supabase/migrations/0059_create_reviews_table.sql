-- Create listing_reviews table for user comments/ratings on listings
create table if not exists public.listing_reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null check (char_length(comment) > 0 and char_length(comment) <= 1000),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,

  -- Prevent duplicate reviews from same user on same listing
  unique(listing_id, reviewer_id)
);

-- Indexes
create index idx_reviews_listing_id on public.listing_reviews(listing_id);
create index idx_reviews_reviewer_id on public.listing_reviews(reviewer_id);
create index idx_reviews_created_at on public.listing_reviews(created_at desc);

-- RLS Policies
alter table public.listing_reviews enable row level security;

-- Anyone can read reviews
create policy "reviews_select_anyone" on public.listing_reviews
  for select using (true);

-- Only authenticated users can insert reviews
create policy "reviews_insert_authenticated" on public.listing_reviews
  for insert with check (
    auth.role() = 'authenticated'
    and reviewer_id = auth.uid()
  );

-- Users can only update their own reviews
create policy "reviews_update_own" on public.listing_reviews
  for update using (
    auth.role() = 'authenticated'
    and reviewer_id = auth.uid()
  )
  with check (
    auth.role() = 'authenticated'
    and reviewer_id = auth.uid()
  );

-- Users can only delete their own reviews
create policy "reviews_delete_own" on public.listing_reviews
  for delete using (
    auth.role() = 'authenticated'
    and reviewer_id = auth.uid()
  );

-- Trigger to update updated_at
create or replace function public.update_listing_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger listing_reviews_update_updated_at
  before update on public.listing_reviews
  for each row
  execute function public.update_listing_reviews_updated_at();
