-- marketplace-nepal: orders + order_items (fixed-price checkout, no live payment yet)

create type public.order_status as enum ('pending', 'confirmed', 'shipped', 'completed', 'cancelled');

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  delivery_courier_id uuid references public.delivery_couriers (id),
  pickup_selected boolean not null default false,
  status public.order_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now()
);

create index orders_buyer_id_idx on public.orders (buyer_id);
create index orders_seller_id_idx on public.orders (seller_id);

alter table public.orders enable row level security;

create policy "Participants can view their orders"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  listing_id uuid not null references public.listings (id),
  price_at_order numeric(12, 2) not null,
  created_at timestamptz not null default now(),
  unique (order_id, listing_id)
);

create index order_items_order_id_idx on public.order_items (order_id);

alter table public.order_items enable row level security;

create policy "Participants can view items in their orders"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (orders.buyer_id = auth.uid() or orders.seller_id = auth.uid())
    )
  );

create policy "Buyers can add items to their own orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.buyer_id = auth.uid()
    )
  );
