-- marketplace-nepal Phase 0 schema: profiles, categories, listings, listing_images, favorites
-- Run this in the Supabase SQL editor, or via `supabase db push`, on a fresh project.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  phone text not null unique,
  phone_verified boolean not null default false,
  avatar_url text,
  district text,
  city text,
  is_business boolean not null default false,
  rating_avg numeric(3, 2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are publicly readable"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up, reading
-- display_name/phone out of the signUp() `options.data` metadata.
-- Runs as SECURITY DEFINER so it bypasses RLS on public.profiles.
create function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone'
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  name text not null,
  slug text not null unique,
  icon text
);

alter table public.categories enable row level security;

create policy "Categories are publicly readable"
  on public.categories for select
  using (true);

-- ---------------------------------------------------------------------------
-- listings
-- ---------------------------------------------------------------------------
create type public.listing_condition as enum ('new', 'used');
create type public.listing_type as enum ('classified', 'fixed_price');
create type public.listing_status as enum ('draft', 'active', 'sold', 'expired', 'removed');

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  category_id uuid not null references public.categories (id),
  title text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  currency text not null default 'NPR',
  condition public.listing_condition not null,
  listing_type public.listing_type not null default 'classified',
  status public.listing_status not null default 'active',
  district text not null,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days')
);

create index listings_category_id_idx on public.listings (category_id);
create index listings_seller_id_idx on public.listings (seller_id);
create index listings_status_created_at_idx on public.listings (status, created_at desc);
create index listings_district_idx on public.listings (district);
create index listings_title_trgm_idx on public.listings using gin (to_tsvector('english', title || ' ' || description));

alter table public.listings enable row level security;

create policy "Active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or seller_id = auth.uid());

create policy "Sellers can insert their own listings"
  on public.listings for insert
  with check (seller_id = auth.uid());

create policy "Sellers can update their own listings"
  on public.listings for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Sellers can delete their own listings"
  on public.listings for delete
  using (seller_id = auth.uid());

create function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_listings_updated_at
  before update on public.listings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- listing_images
-- ---------------------------------------------------------------------------
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create index listing_images_listing_id_idx on public.listing_images (listing_id);

alter table public.listing_images enable row level security;

create policy "Listing images are publicly readable"
  on public.listing_images for select
  using (true);

create policy "Sellers can manage images for their own listings"
  on public.listing_images for all
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_images.listing_id
        and listings.seller_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- favorites
-- ---------------------------------------------------------------------------
create table public.favorites (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Users can view their own favorites"
  on public.favorites for select
  using (user_id = auth.uid());

create policy "Users can add their own favorites"
  on public.favorites for insert
  with check (user_id = auth.uid());

create policy "Users can remove their own favorites"
  on public.favorites for delete
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- storage: listing-images bucket
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Listing images bucket is publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Owners can delete their own uploaded listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- seed categories
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, icon) values
  ('Vehicles', 'vehicles', 'car'),
  ('Real Estate', 'real-estate', 'home'),
  ('Electronics', 'electronics', 'smartphone'),
  ('Home & Living', 'home-living', 'sofa'),
  ('Fashion', 'fashion', 'shirt'),
  ('Jobs', 'jobs', 'briefcase'),
  ('Services', 'services', 'wrench'),
  ('Hobbies & Sports', 'hobbies-sports', 'dumbbell'),
  ('Pets', 'pets', 'paw-print'),
  ('Agriculture', 'agriculture', 'tractor');
