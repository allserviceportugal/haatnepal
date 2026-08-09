-- haatnepal: Comprehensive Vehicles marketplace — Nepal-focused taxonomy,
-- extensive attributes for each vehicle type, draft persistence system

-- ---------------------------------------------------------------------------
-- Add vehicle-specific fields to listings table
-- ---------------------------------------------------------------------------
alter table public.listings
  add column if not exists bluebook_status text,
  add column if not exists registration_year integer,
  add column if not exists manufacturing_year integer,
  add column if not exists import_status text,
  add column if not exists owner_count integer,
  add column if not exists is_modified boolean default false,
  add column if not exists accident_history boolean default false,
  add column if not exists service_history text;

-- ---------------------------------------------------------------------------
-- Create vehicle_brands table: hierarchical Brand → Model → Generation → Variant
-- ---------------------------------------------------------------------------
create table if not exists public.vehicle_brands (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  parent_id uuid references public.vehicle_brands (id) on delete cascade,
  name text not null,
  slug text not null,
  level text not null check (level in ('brand', 'model', 'generation', 'variant')),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  unique (slug, category_id)
);

create index if not exists vehicle_brands_category_id_idx on public.vehicle_brands (category_id);
create index if not exists vehicle_brands_parent_id_idx on public.vehicle_brands (parent_id);

alter table public.vehicle_brands enable row level security;

create policy if not exists "Vehicle brands are publicly readable"
  on public.vehicle_brands for select
  using (true);

-- ---------------------------------------------------------------------------
-- Create draft_listings table for persistent draft support
-- ---------------------------------------------------------------------------
create type if not exists public.draft_status as enum ('auto-saved', 'user-saved', 'being-created');

create table if not exists public.draft_listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text,
  description text,
  price numeric(12, 2),
  category_id uuid references public.categories (id),
  condition text,
  listing_type text,
  district text,
  city text,
  municipality text,
  ward_number integer,
  tole text,
  bluebook_status text,
  registration_year integer,
  manufacturing_year integer,
  import_status text,
  owner_count integer,
  is_modified boolean default false,
  accident_history boolean default false,
  service_history text,
  category_path jsonb,
  attribute_values jsonb default '{}',
  courier_ids text[],
  image_urls text[],
  status public.draft_status not null default 'auto-saved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index if not exists draft_listings_seller_id_idx on public.draft_listings (seller_id);
create index if not exists draft_listings_category_id_idx on public.draft_listings (category_id);
create index if not exists draft_listings_updated_at_idx on public.draft_listings (updated_at desc);

alter table public.draft_listings enable row level security;

create policy if not exists "Users can view their own drafts"
  on public.draft_listings for select
  using (seller_id = auth.uid());

create policy if not exists "Users can create their own drafts"
  on public.draft_listings for insert
  with check (seller_id = auth.uid());

create policy if not exists "Users can update their own drafts"
  on public.draft_listings for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy if not exists "Users can delete their own drafts"
  on public.draft_listings for delete
  using (seller_id = auth.uid());

create trigger if not exists set_draft_listings_updated_at
  before update on public.draft_listings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Add vehicle subcategories to existing Vehicles category
-- ---------------------------------------------------------------------------

do $$
declare
  vehicles_id uuid;
begin
  -- Get the Vehicles category ID
  select id into vehicles_id from public.categories where slug = 'vehicles' limit 1;

  if vehicles_id is not null then
    -- Add main vehicle subcategories if they don't exist
    insert into public.categories (parent_id, name, slug)
    values
      (vehicles_id, 'SUVs & Jeeps', 'suvs-jeeps'),
      (vehicles_id, 'Electric Vehicles', 'electric-vehicles'),
      (vehicles_id, 'Three Wheelers', 'three-wheelers'),
      (vehicles_id, 'Tractors & Agricultural', 'tractors-agricultural'),
      (vehicles_id, 'Car Spare Parts', 'car-spare-parts'),
      (vehicles_id, 'Motorcycle Spare Parts', 'motorcycle-spare-parts'),
      (vehicles_id, 'Commercial Vehicle Parts', 'commercial-vehicle-parts'),
      (vehicles_id, 'Vehicle Rental Services', 'vehicle-rental-services'),
      (vehicles_id, 'Vehicle Repair & Services', 'vehicle-repair-services')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add specific car subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  cars_id uuid;
begin
  select id into cars_id from public.categories where slug = 'cars' limit 1;

  if cars_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (cars_id, 'Sedans', 'sedans'),
      (cars_id, 'Hatchbacks', 'hatchbacks'),
      (cars_id, 'MPVs & 7-Seaters', 'mpvs-7-seaters'),
      (cars_id, 'Coupes & Convertibles', 'coupes-convertibles'),
      (cars_id, 'Station Wagons', 'station-wagons')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add SUV subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  suvs_id uuid;
begin
  select id into suvs_id from public.categories where slug = 'suvs-jeeps' limit 1;

  if suvs_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (suvs_id, 'Compact SUVs', 'compact-suvs'),
      (suvs_id, 'Mid-size SUVs', 'mid-size-suvs'),
      (suvs_id, 'Full-size SUVs', 'full-size-suvs'),
      (suvs_id, 'Jeeps', 'jeeps')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add motorcycle subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  motos_id uuid;
begin
  select id into motos_id from public.categories where slug = 'motorcycles-scooters' limit 1;

  if motos_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (motos_id, 'Street Bikes', 'street-bikes'),
      (motos_id, 'Cruisers', 'cruisers'),
      (motos_id, 'Touring Bikes', 'touring-bikes'),
      (motos_id, 'Sports Bikes', 'sports-bikes'),
      (motos_id, 'Dirt Bikes & Off-road', 'dirt-bikes-off-road'),
      (motos_id, 'Scooters', 'scooters-category'),
      (motos_id, 'Mopeds', 'mopeds')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add EV subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  ev_id uuid;
begin
  select id into ev_id from public.categories where slug = 'electric-vehicles' limit 1;

  if ev_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (ev_id, 'Electric Cars', 'electric-cars'),
      (ev_id, 'Electric Scooters', 'electric-scooters'),
      (ev_id, 'Electric Motorcycles', 'electric-motorcycles'),
      (ev_id, 'Electric Bikes', 'electric-bikes')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add commercial vehicle subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  comm_id uuid;
begin
  select id into comm_id from public.categories where slug = 'commercial-trucks' limit 1;

  if comm_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (comm_id, 'Vans', 'vans'),
      (comm_id, 'Light Commercial Vehicles', 'light-commercial-vehicles'),
      (comm_id, 'Medium & Heavy Trucks', 'medium-heavy-trucks'),
      (comm_id, 'Buses & Coaches', 'buses-coaches'),
      (comm_id, 'Pickup Trucks', 'pickup-trucks')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add three wheeler subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  three_w_id uuid;
begin
  select id into three_w_id from public.categories where slug = 'three-wheelers' limit 1;

  if three_w_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (three_w_id, 'Auto Rickshaws', 'auto-rickshaws'),
      (three_w_id, 'Three Wheel Motorcycles', 'three-wheel-motorcycles'),
      (three_w_id, 'Electric Auto Rickshaws', 'electric-auto-rickshaws')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add tractor subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  tractor_id uuid;
begin
  select id into tractor_id from public.categories where slug = 'tractors-agricultural' limit 1;

  if tractor_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (tractor_id, 'Farm Tractors', 'farm-tractors'),
      (tractor_id, 'Agricultural Machinery', 'agricultural-machinery'),
      (tractor_id, 'Harvesters & Threshers', 'harvesters-threshers')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add construction equipment subtypes
-- ---------------------------------------------------------------------------

do $$
declare
  constr_id uuid;
begin
  select id into constr_id from public.categories where slug = 'construction-equipment' limit 1;

  if constr_id is not null then
    insert into public.categories (parent_id, name, slug)
    values
      (constr_id, 'Excavators & Loaders', 'excavators-loaders'),
      (constr_id, 'Bulldozers & Graders', 'bulldozers-graders'),
      (constr_id, 'Cranes & Lifts', 'cranes-lifts'),
      (constr_id, 'Compressors & Generators', 'compressors-generators')
    on conflict(slug) do nothing;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add vehicle attributes for Cars
-- ---------------------------------------------------------------------------

do $$
declare
  cars_id uuid;
begin
  select id into cars_id from public.categories where slug = 'cars' limit 1;

  if cars_id is not null then
    delete from public.category_attributes where category_id = cars_id;

    insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
    values
      (cars_id, 'brand', 'Brand', 'text'::public.attribute_input_type, null, true, 1),
      (cars_id, 'model', 'Model', 'text'::public.attribute_input_type, null, true, 2),
      (cars_id, 'model_year', 'Model Year', 'number'::public.attribute_input_type, null, false, 3),
      (cars_id, 'registration_year', 'Registration Year', 'number'::public.attribute_input_type, null, false, 4),
      (cars_id, 'mileage_km', 'Mileage (km)', 'number'::public.attribute_input_type, null, false, 5),
      (cars_id, 'fuel_type', 'Fuel Type', 'select'::public.attribute_input_type, '["Petrol", "Diesel", "Hybrid", "CNG"]'::jsonb, false, 6),
      (cars_id, 'transmission', 'Transmission', 'select'::public.attribute_input_type, '["Manual", "Automatic", "CVT"]'::jsonb, false, 7),
      (cars_id, 'body_type', 'Body Type', 'select'::public.attribute_input_type, '["Sedan", "SUV", "Hatchback", "MPV", "Wagon", "Coupe"]'::jsonb, false, 8),
      (cars_id, 'engine_capacity_cc', 'Engine Capacity (cc)', 'number'::public.attribute_input_type, null, false, 9),
      (cars_id, 'power_bhp', 'Power (bhp)', 'number'::public.attribute_input_type, null, false, 10),
      (cars_id, 'torque_nm', 'Torque (Nm)', 'number'::public.attribute_input_type, null, false, 11),
      (cars_id, 'seats', 'Seats', 'select'::public.attribute_input_type, '["2", "4", "5", "7", "8+"]'::jsonb, false, 12),
      (cars_id, 'doors', 'Doors', 'select'::public.attribute_input_type, '["2", "3", "4", "5"]'::jsonb, false, 13),
      (cars_id, 'color', 'Color', 'select'::public.attribute_input_type, '["White", "Black", "Silver", "Gray", "Red", "Blue", "Brown", "Orange", "Green", "Other"]'::jsonb, false, 14);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add vehicle attributes for Motorcycles
-- ---------------------------------------------------------------------------

do $$
declare
  motos_id uuid;
begin
  select id into motos_id from public.categories where slug = 'motorcycles-scooters' limit 1;

  if motos_id is not null then
    delete from public.category_attributes where category_id = motos_id;

    insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
    values
      (motos_id, 'brand', 'Brand', 'text'::public.attribute_input_type, null, true, 1),
      (motos_id, 'model', 'Model', 'text'::public.attribute_input_type, null, true, 2),
      (motos_id, 'model_year', 'Model Year', 'number'::public.attribute_input_type, null, false, 3),
      (motos_id, 'engine_cc', 'Engine CC', 'number'::public.attribute_input_type, null, false, 4),
      (motos_id, 'mileage_km', 'Mileage (km)', 'number'::public.attribute_input_type, null, false, 5),
      (motos_id, 'fuel_type', 'Fuel Type', 'select'::public.attribute_input_type, '["Petrol", "Diesel", "CNG"]'::jsonb, false, 6),
      (motos_id, 'transmission', 'Transmission', 'select'::public.attribute_input_type, '["Manual", "Automatic"]'::jsonb, false, 7),
      (motos_id, 'power_bhp', 'Power (bhp)', 'number'::public.attribute_input_type, null, false, 8),
      (motos_id, 'abs_available', 'ABS Available', 'boolean'::public.attribute_input_type, null, false, 9),
      (motos_id, 'color', 'Color', 'select'::public.attribute_input_type, '["Red", "Black", "Blue", "White", "Silver", "Yellow", "Orange", "Green", "Other"]'::jsonb, false, 10);
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Add vehicle attributes for Electric Vehicles
-- ---------------------------------------------------------------------------

do $$
declare
  ev_id uuid;
begin
  select id into ev_id from public.categories where slug = 'electric-vehicles' limit 1;

  if ev_id is not null then
    delete from public.category_attributes where category_id = ev_id;

    insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
    values
      (ev_id, 'brand', 'Brand', 'text'::public.attribute_input_type, null, true, 1),
      (ev_id, 'model', 'Model', 'text'::public.attribute_input_type, null, true, 2),
      (ev_id, 'model_year', 'Model Year', 'number'::public.attribute_input_type, null, false, 3),
      (ev_id, 'battery_capacity_kwh', 'Battery Capacity (kWh)', 'number'::public.attribute_input_type, null, false, 4),
      (ev_id, 'claimed_range_km', 'Claimed Range (km)', 'number'::public.attribute_input_type, null, false, 5),
      (ev_id, 'motor_power_kw', 'Motor Power (kW)', 'number'::public.attribute_input_type, null, false, 6),
      (ev_id, 'charging_type', 'Charging Type', 'select'::public.attribute_input_type, '["AC Only", "DC Fast Charge", "Both AC & DC"]'::jsonb, false, 7),
      (ev_id, 'battery_warranty_years', 'Battery Warranty (years)', 'number'::public.attribute_input_type, null, false, 8),
      (ev_id, 'color', 'Color', 'select'::public.attribute_input_type, '["White", "Black", "Silver", "Gray", "Blue", "Red", "Other"]'::jsonb, false, 9);
  end if;
end $$;
