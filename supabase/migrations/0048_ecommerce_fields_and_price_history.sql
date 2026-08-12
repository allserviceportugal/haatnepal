-- haatnepal: E-commerce fields for direct-purchase listings + price history tracking
-- Adds product metadata (SKU, stock, delivery, warranty) and full price change history

-- =========================================================================
-- 1. E-COMMERCE FIELDS ON LISTINGS TABLE
-- =========================================================================

alter table public.listings
  add column if not exists sku text,
  add column if not exists stock_quantity integer,              -- null = unlimited/not tracked
  add column if not exists units_sold integer not null default 0,
  add column if not exists delivery_fee numeric(10, 2),
  add column if not exists delivery_time_days integer,
  add column if not exists return_policy text,
  add column if not exists warranty_period text,
  add column if not exists payment_methods text[];             -- array: ["cash", "transfer", "card"]

-- Constraints
alter table public.listings
  add constraint listings_stock_quantity_check check (stock_quantity is null or stock_quantity >= 0);

alter table public.listings
  add constraint listings_sku_unique unique (seller_id, sku);  -- SKU unique per seller, not global

-- Index for product lookups by SKU
create index if not exists listings_seller_sku_idx on public.listings (seller_id, sku) where sku is not null;

-- =========================================================================
-- 2. LISTING_VARIANTS - One-to-many variants with their own SKU/price/stock
-- =========================================================================

create table if not exists public.listing_variants (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  variant_name text not null,                  -- e.g. "Red / Large", "Blue / Small"
  sku text,
  price_override numeric(12, 2),               -- null = use base listing.price
  stock_quantity integer,                      -- null = unlimited
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique(listing_id, variant_name)
);

create index if not exists listing_variants_listing_id_idx on public.listing_variants (listing_id);
create index if not exists listing_variants_sku_idx on public.listing_variants (sku) where sku is not null;

alter table public.listing_variants enable row level security;

create policy "Variants are publicly readable"
  on public.listing_variants for select using (true);

create policy "Sellers can manage variants for their listings"
  on public.listing_variants for all
  using (
    exists (
      select 1 from public.listings l
      where l.id = listing_variants.listing_id
        and l.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings l
      where l.id = listing_variants.listing_id
        and l.seller_id = auth.uid()
    )
  );

-- =========================================================================
-- 3. PRICE HISTORY - Auditable record of every price change
-- =========================================================================

create table if not exists public.listing_price_history (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  old_price numeric(12, 2) not null,
  new_price numeric(12, 2) not null,
  changed_at timestamptz not null default now(),
  changed_by uuid references public.profiles(id),          -- who changed it (always the seller, but track anyway)
  reason text                                              -- optional: "promotion", "market adjustment", etc.
);

create index if not exists listing_price_history_listing_id_idx on public.listing_price_history (listing_id, changed_at desc);
create index if not exists listing_price_history_changed_at_idx on public.listing_price_history (changed_at desc);

alter table public.listing_price_history enable row level security;

create policy "Price history is publicly readable"
  on public.listing_price_history for select using (true);

-- Trigger to auto-log price changes (fires whenever price is updated)
create or replace function public.log_listing_price_change() returns trigger as $$
begin
  if new.price is distinct from old.price and new.price is not null then
    insert into public.listing_price_history (listing_id, old_price, new_price, changed_by)
    values (new.id, old.price, new.price, new.seller_id);
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists listings_log_price_change on public.listings;
create trigger listings_log_price_change
  after update on public.listings
  for each row
  execute function public.log_listing_price_change();

-- =========================================================================
-- 4. ORDER_ITEMS - Add variant tracking for variant-aware purchases
-- =========================================================================

-- Add variant_id column to order_items
alter table public.order_items
  add column if not exists variant_id uuid references public.listing_variants(id) on delete restrict;

-- Drop the old unique constraint and add a new one that includes variant_id
-- This allows the same listing to appear once per variant
alter table public.order_items
  drop constraint if exists order_items_order_id_listing_id_key;

alter table public.order_items
  add constraint order_items_order_id_listing_id_variant_id_key
    unique(order_id, listing_id, variant_id);

create index if not exists order_items_variant_id_idx on public.order_items (variant_id);

-- =========================================================================
-- 5. HELPER RPC - Get recent price change for a listing (for display)
-- =========================================================================

create or replace function public.get_listing_recent_price_change(p_listing_id uuid)
returns table(old_price numeric, new_price numeric, changed_at timestamptz) as $$
  select old_price, new_price, changed_at
  from public.listing_price_history
  where listing_id = p_listing_id
  order by changed_at desc
  limit 2;
$$ language sql stable;
