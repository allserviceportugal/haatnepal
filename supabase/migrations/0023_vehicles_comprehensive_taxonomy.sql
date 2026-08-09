-- haatnepal: Comprehensive Vehicles marketplace — Nepal-focused taxonomy,
-- extensive attributes for each vehicle type, draft persistence system

-- ---------------------------------------------------------------------------
-- Enhanced Vehicles category hierarchy
-- ---------------------------------------------------------------------------

-- Get the existing Vehicles root category ID for reference
-- and create missing vehicle subcategories

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicles'), name, slug
from (values
  ('SUVs & Jeeps', 'suvs-jeeps'),
  ('Electric Vehicles', 'electric-vehicles'),
  ('Three Wheelers', 'three-wheelers'),
  ('Tractors & Agricultural', 'tractors-agricultural'),
  ('Car Spare Parts', 'car-spare-parts'),
  ('Motorcycle Spare Parts', 'motorcycle-spare-parts'),
  ('Commercial Vehicle Parts', 'commercial-vehicle-parts'),
  ('Vehicle Rental Services', 'vehicle-rental-services'),
  ('Vehicle Repair & Services', 'vehicle-repair-services')
) as t(name, slug)
on conflict(slug) do nothing;

-- Create sub-leaves for more specific categorization
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'cars'), name, slug
from (values
  ('Sedans', 'sedans'),
  ('Hatchbacks', 'hatchbacks'),
  ('MPVs & 7-Seaters', 'mpvs-7-seaters'),
  ('Coupes & Convertibles', 'coupes-convertibles'),
  ('Station Wagons', 'station-wagons')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'suvs-jeeps'), name, slug
from (values
  ('Compact SUVs', 'compact-suvs'),
  ('Mid-size SUVs', 'mid-size-suvs'),
  ('Full-size SUVs', 'full-size-suvs'),
  ('Jeeps', 'jeeps')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'motorcycles-scooters'), name, slug
from (values
  ('Street Bikes', 'street-bikes'),
  ('Cruisers', 'cruisers'),
  ('Touring Bikes', 'touring-bikes'),
  ('Sports Bikes', 'sports-bikes'),
  ('Dirt Bikes & Off-road', 'dirt-bikes-off-road'),
  ('Scooters', 'scooters-category'),
  ('Mopeds', 'mopeds')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'electric-vehicles'), name, slug
from (values
  ('Electric Cars', 'electric-cars'),
  ('Electric Scooters', 'electric-scooters'),
  ('Electric Motorcycles', 'electric-motorcycles'),
  ('Electric Bikes', 'electric-bikes')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'commercial-trucks'), name, slug
from (values
  ('Vans', 'vans'),
  ('Light Commercial Vehicles', 'light-commercial-vehicles'),
  ('Medium & Heavy Trucks', 'medium-heavy-trucks'),
  ('Buses & Coaches', 'buses-coaches'),
  ('Pickup Trucks', 'pickup-trucks')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'three-wheelers'), name, slug
from (values
  ('Auto Rickshaws', 'auto-rickshaws'),
  ('Three Wheel Motorcycles', 'three-wheel-motorcycles'),
  ('Electric Auto Rickshaws', 'electric-auto-rickshaws')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tractors-agricultural'), name, slug
from (values
  ('Farm Tractors', 'farm-tractors'),
  ('Agricultural Machinery', 'agricultural-machinery'),
  ('Harvesters & Threshers', 'harvesters-threshers')
) as t(name, slug)
on conflict(slug) do nothing;

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'construction-equipment'), name, slug
from (values
  ('Excavators & Loaders', 'excavators-loaders'),
  ('Bulldozers & Graders', 'bulldozers-graders'),
  ('Cranes & Lifts', 'cranes-lifts'),
  ('Compressors & Generators', 'compressors-generators')
) as t(name, slug)
on conflict(slug) do nothing;

-- ---------------------------------------------------------------------------
-- Vehicle condition type enum
-- ---------------------------------------------------------------------------
-- Already exists as listing_condition (new/used), but will extend attributes
-- to include condition-specific fields like registration_year, import_status, etc.

-- ---------------------------------------------------------------------------
-- vehicle_brands table: hierarchical Brand → Model → Generation → Variant
-- ---------------------------------------------------------------------------
create table public.vehicle_brands (
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

create index vehicle_brands_category_id_idx on public.vehicle_brands (category_id);
create index vehicle_brands_parent_id_idx on public.vehicle_brands (parent_id);

alter table public.vehicle_brands enable row level security;

create policy "Vehicle brands are publicly readable"
  on public.vehicle_brands for select
  using (true);

-- ---------------------------------------------------------------------------
-- listings: add vehicle-specific fields
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
-- draft_listings table: persistent draft support
-- ---------------------------------------------------------------------------
create type public.draft_status as enum ('auto-saved', 'user-saved', 'being-created');

create table public.draft_listings (
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

  -- Vehicle-specific fields
  bluebook_status text,
  registration_year integer,
  manufacturing_year integer,
  import_status text,
  owner_count integer,
  is_modified boolean default false,
  accident_history boolean default false,
  service_history text,

  -- Store category path (parent chain) as JSON
  category_path jsonb,

  -- Store all attribute values as JSON (key -> value)
  attribute_values jsonb default '{}',

  -- Delivery courier selections
  courier_ids text[],

  -- Image URLs (stored temporarily)
  image_urls text[],

  -- Track draft status and auto-save
  status public.draft_status not null default 'auto-saved',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index draft_listings_seller_id_idx on public.draft_listings (seller_id);
create index draft_listings_category_id_idx on public.draft_listings (category_id);
create index draft_listings_updated_at_idx on public.draft_listings (updated_at desc);

alter table public.draft_listings enable row level security;

create policy "Users can view their own drafts"
  on public.draft_listings for select
  using (seller_id = auth.uid());

create policy "Users can create their own drafts"
  on public.draft_listings for insert
  with check (seller_id = auth.uid());

create policy "Users can update their own drafts"
  on public.draft_listings for update
  using (seller_id = auth.uid())
  with check (seller_id = auth.uid());

create policy "Users can delete their own drafts"
  on public.draft_listings for delete
  using (seller_id = auth.uid());

create trigger set_draft_listings_updated_at
  before update on public.draft_listings
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Comprehensive attributes for all vehicle types
-- ---------------------------------------------------------------------------

-- CARS (generic, inherited by all car types)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'cars'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('registration_year', 'Registration Year', 'number', null, false, 4),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 5),
  ('condition_specific', 'Condition', 'select', '["New", "Used", "Reconditioned", "Imported Used", "Demo/Test"]', false, 6),
  ('fuel_type', 'Fuel Type', 'select', '["Petrol", "Diesel", "Hybrid", "CNG"]', false, 7),
  ('transmission', 'Transmission', 'select', '["Manual", "Automatic", "CVT"]', false, 8),
  ('body_type', 'Body Type', 'select', '["Sedan", "SUV", "Hatchback", "MPV", "Wagon", "Coupe"]', false, 9),
  ('engine_capacity_cc', 'Engine Capacity (cc)', 'number', null, false, 10),
  ('power_bhp', 'Power (bhp)', 'number', null, false, 11),
  ('torque_nm', 'Torque (Nm)', 'number', null, false, 12),
  ('seats', 'Seats', 'select', '["2", "4", "5", "7", "8+"]', false, 13),
  ('doors', 'Doors', 'select', '["2", "3", "4", "5"]', false, 14),
  ('fuel_tank_capacity', 'Fuel Tank Capacity (L)', 'number', null, false, 15),
  ('emission_standard', 'Emission Standard', 'select', '["Euro 0", "Euro 1", "Euro 2", "Euro 3", "Euro 4", "Euro 5", "Euro 6"]', false, 16),
  ('drive_type', 'Drive Type', 'select', '["Front-wheel", "Rear-wheel", "All-wheel"]', false, 17),
  ('color', 'Color', 'select', '["White", "Black", "Silver", "Gray", "Red", "Blue", "Brown", "Orange", "Green", "Other"]', false, 18),
  ('ownership', 'Ownership', 'select', '["1st Owner", "2nd Owner", "3rd Owner", "4+ Owners"]', false, 19)
) as t(key, label, input_type, options, is_required, sort_order);

-- MOTORCYCLES (generic, inherited by specific types)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'motorcycles-scooters'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('registration_year', 'Registration Year', 'number', null, false, 4),
  ('engine_cc', 'Engine CC', 'number', null, false, 5),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 6),
  ('fuel_type', 'Fuel Type', 'select', '["Petrol", "Diesel", "CNG"]', false, 7),
  ('transmission', 'Transmission', 'select', '["Manual", "Automatic"]', false, 8),
  ('gear_count', 'Gear Count', 'number', null, false, 9),
  ('power_bhp', 'Power (bhp)', 'number', null, false, 10),
  ('torque_nm', 'Torque (Nm)', 'number', null, false, 11),
  ('kerb_weight_kg', 'Kerb Weight (kg)', 'number', null, false, 12),
  ('fuel_tank_capacity', 'Fuel Tank Capacity (L)', 'number', null, false, 13),
  ('seat_height_mm', 'Seat Height (mm)', 'number', null, false, 14),
  ('abs_available', 'ABS Available', 'boolean', null, false, 15),
  ('brake_type', 'Brake Type', 'select', '["Drum", "Disc", "Disc+Disc"]', false, 16),
  ('color', 'Color', 'select', '["Red", "Black", "Blue", "White", "Silver", "Yellow", "Orange", "Green", "Other"]', false, 17),
  ('ownership', 'Ownership', 'select', '["1st Owner", "2nd Owner", "3rd+ Owners"]', false, 18),
  ('condition', 'Condition', 'select', '["New", "Like New", "Excellent", "Good", "Fair", "Poor"]', false, 19)
) as t(key, label, input_type, options, is_required, sort_order);

-- ELECTRIC VEHICLES
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'electric-vehicles'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('registration_year', 'Registration Year', 'number', null, false, 4),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 5),
  ('battery_capacity_kwh', 'Battery Capacity (kWh)', 'number', null, false, 6),
  ('battery_type', 'Battery Type', 'select', '["Lithium Ion (Li-ion)", "Lithium Polymer (LiPo)", "Other"]', false, 7),
  ('claimed_range_km', 'Claimed Range (km)', 'number', null, false, 8),
  ('real_world_range_km', 'Real-world Range (km)', 'number', null, false, 9),
  ('motor_power_kw', 'Motor Power (kW)', 'number', null, false, 10),
  ('motor_power_bhp', 'Motor Power (bhp)', 'number', null, false, 11),
  ('motor_torque_nm', 'Motor Torque (Nm)', 'number', null, false, 12),
  ('ac_charging_time_hours', 'AC Charging Time (hours)', 'number', null, false, 13),
  ('dc_fast_charging_time_minutes', 'DC Fast Charging Time (minutes)', 'number', null, false, 14),
  ('charging_type_supported', 'Charging Type Supported', 'select', '["AC Only", "DC Fast Charge", "Both AC & DC"]', false, 15),
  ('battery_warranty_years', 'Battery Warranty (years)', 'number', null, false, 16),
  ('body_type', 'Body Type', 'select', '["Sedan", "SUV", "Hatchback", "Bike", "Scooter"]', false, 17),
  ('seats', 'Seats', 'select', '["2", "4", "5", "7", "8+"]', false, 18),
  ('color', 'Color', 'select', '["White", "Black", "Silver", "Gray", "Blue", "Red", "Other"]', false, 19),
  ('regenerative_braking', 'Regenerative Braking', 'boolean', null, false, 20)
) as t(key, label, input_type, options, is_required, sort_order);

-- COMMERCIAL VEHICLES / TRUCKS
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'commercial-trucks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('vehicle_type', 'Vehicle Type', 'select', '["Van", "Light Commercial", "Medium Truck", "Heavy Truck", "Bus", "Pickup"]', false, 4),
  ('payload_capacity_kg', 'Payload Capacity (kg)', 'number', null, false, 5),
  ('gross_vehicle_weight_rating_kg', 'GVWR (kg)', 'number', null, false, 6),
  ('body_type', 'Body Type', 'select', '["Open", "Closed", "Refrigerated", "Flatbed", "Tanker", "Tipper", "Box"]', false, 7),
  ('cab_type', 'Cab Type', 'select', '["Single", "Extended", "Double"]', false, 8),
  ('axles', 'Axles', 'select', '["2", "3", "4", "5+"]', false, 9),
  ('engine_cc', 'Engine CC', 'number', null, false, 10),
  ('fuel_type', 'Fuel Type', 'select', '["Petrol", "Diesel", "CNG", "Electric"]', false, 11),
  ('transmission', 'Transmission', 'select', '["Manual", "Automatic"]', false, 12),
  ('wheelbase_mm', 'Wheelbase (mm)', 'number', null, false, 13),
  ('cargo_length_mm', 'Cargo Length (mm)', 'number', null, false, 14),
  ('cargo_width_mm', 'Cargo Width (mm)', 'number', null, false, 15),
  ('cargo_height_mm', 'Cargo Height (mm)', 'number', null, false, 16),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 17),
  ('color', 'Color', 'select', '["White", "Yellow", "Blue", "Red", "Black", "Other"]', false, 18)
) as t(key, label, input_type, options, is_required, sort_order);

-- TRACTORS & AGRICULTURAL MACHINERY
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'tractors-agricultural'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('horsepower', 'Horsepower', 'number', null, false, 4),
  ('pto_horsepower', 'PTO Horsepower', 'number', null, false, 5),
  ('drive_type', 'Drive Type', 'select', '["2WD", "4WD/AWD"]', false, 6),
  ('hydraulic_capacity_cc', 'Hydraulic Capacity (cc)', 'number', null, false, 7),
  ('lifting_capacity_kg', 'Lifting Capacity (kg)', 'number', null, false, 8),
  ('engine_type', 'Engine Type', 'select', '["Petrol", "Diesel", "Natural Gas"]', false, 9),
  ('transmission', 'Transmission', 'select', '["Manual", "Power Shuttle", "Hydrostatic"]', false, 10),
  ('hours_used', 'Hours Used (engine hours)', 'number', null, false, 11),
  ('attachment_compatibility', 'Attachment Compatibility', 'text', null, false, 12)
) as t(key, label, input_type, options, is_required, sort_order);

-- THREE WHEELERS
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'three-wheelers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('model_year', 'Model Year', 'number', null, false, 3),
  ('three_wheeler_type', 'Type', 'select', '["Auto Rickshaw", "Three Wheel Motorcycle", "Electric Auto"]', false, 4),
  ('engine_cc', 'Engine CC', 'number', null, false, 5),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 6),
  ('fuel_type', 'Fuel Type', 'select', '["Petrol", "Diesel", "CNG", "Electric", "LPG"]', false, 7),
  ('seating_capacity', 'Seating Capacity', 'number', null, false, 8),
  ('registration_year', 'Registration Year', 'number', null, false, 9),
  ('color', 'Color', 'select', '["Yellow", "Black", "Blue", "Red", "White", "Other"]', false, 10)
) as t(key, label, input_type, options, is_required, sort_order);
