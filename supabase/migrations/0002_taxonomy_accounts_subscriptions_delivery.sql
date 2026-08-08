-- marketplace-nepal: category/subcategory taxonomy + structured filters,
-- account types + subscription plans + listing quotas, delivery couriers.

-- ---------------------------------------------------------------------------
-- subscription_plans
-- ---------------------------------------------------------------------------
create type public.subscription_tier as enum ('normal', 'pro', 'business', 'custom');

create table public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  key public.subscription_tier not null unique,
  name text not null,
  monthly_listing_quota integer, -- null = unlimited
  allows_promoted_listings boolean not null default false,
  allows_storefront_branding boolean not null default false,
  is_paid boolean not null default false,
  price_npr numeric(10, 2), -- null = negotiated (Custom tier)
  description text not null
);

alter table public.subscription_plans enable row level security;

create policy "Subscription plans are publicly readable"
  on public.subscription_plans for select
  using (true);

insert into public.subscription_plans (key, name, monthly_listing_quota, allows_promoted_listings, allows_storefront_branding, is_paid, price_npr, description) values
  ('normal', 'Normal', 5, false, false, false, 0, 'Free plan for individual sellers — perfect for occasional selling.'),
  ('business', 'Business', 10, false, false, false, 0, 'Free plan for registered businesses — more room to list your inventory.'),
  ('pro', 'Pro', null, true, true, true, 999, 'For power sellers — unlimited listings, promoted placement, and a branded storefront.'),
  ('custom', 'Custom', null, true, true, true, null, 'For dealerships and large sellers — negotiated pricing and dedicated support.');

-- ---------------------------------------------------------------------------
-- profiles: account_type + subscription_plan_id (replaces is_business)
-- ---------------------------------------------------------------------------
create type public.account_type as enum ('individual', 'business');

alter table public.profiles
  add column account_type public.account_type not null default 'individual',
  add column subscription_plan_id uuid references public.subscription_plans (id),
  drop column is_business;

update public.profiles p
set subscription_plan_id = (
  select id from public.subscription_plans
  where key = (case p.account_type when 'business' then 'business' else 'normal' end)::public.subscription_tier
)
where subscription_plan_id is null;

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
declare
  new_account_type public.account_type;
  matching_plan_id uuid;
begin
  new_account_type := coalesce(
    (new.raw_user_meta_data ->> 'account_type')::public.account_type,
    'individual'
  );

  select id into matching_plan_id
  from public.subscription_plans
  where key = (case new_account_type when 'business' then 'business' else 'normal' end)::public.subscription_tier;

  insert into public.profiles (id, display_name, phone, account_type, subscription_plan_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'phone',
    new_account_type,
    matching_plan_id
  );
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------------
-- delivery_couriers
-- ---------------------------------------------------------------------------
create table public.delivery_couriers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  base_cost_npr numeric(10, 2) not null,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

alter table public.delivery_couriers enable row level security;

create policy "Delivery couriers are publicly readable"
  on public.delivery_couriers for select
  using (true);

insert into public.delivery_couriers (name, base_cost_npr, sort_order) values
  ('Pathao', 150, 1),
  ('NCM (Nepal Can Move)', 200, 2),
  ('Aramex Nepal', 350, 3),
  ('DHL Nepal', 500, 4);

-- ---------------------------------------------------------------------------
-- listings: pickup_available + listing_delivery_options junction
-- ---------------------------------------------------------------------------
alter table public.listings
  add column pickup_available boolean not null default true;

create table public.listing_delivery_options (
  listing_id uuid not null references public.listings (id) on delete cascade,
  courier_id uuid not null references public.delivery_couriers (id) on delete cascade,
  primary key (listing_id, courier_id)
);

alter table public.listing_delivery_options enable row level security;

create policy "Listing delivery options are publicly readable"
  on public.listing_delivery_options for select
  using (true);

create policy "Sellers can manage delivery options for their own listings"
  on public.listing_delivery_options for all
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_delivery_options.listing_id
        and listings.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_delivery_options.listing_id
        and listings.seller_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- category_attributes + listing_attribute_values
-- ---------------------------------------------------------------------------
create type public.attribute_input_type as enum ('text', 'number', 'select', 'boolean');

create table public.category_attributes (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  key text not null,
  label text not null,
  input_type public.attribute_input_type not null,
  options jsonb, -- array of strings, only used when input_type = 'select'
  is_required boolean not null default false,
  sort_order integer not null default 0,
  unique (category_id, key)
);

alter table public.category_attributes enable row level security;

create policy "Category attributes are publicly readable"
  on public.category_attributes for select
  using (true);

create table public.listing_attribute_values (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  attribute_id uuid not null references public.category_attributes (id) on delete cascade,
  value text not null,
  unique (listing_id, attribute_id)
);

create index listing_attribute_values_listing_id_idx on public.listing_attribute_values (listing_id);

alter table public.listing_attribute_values enable row level security;

create policy "Listing attribute values are publicly readable"
  on public.listing_attribute_values for select
  using (true);

create policy "Sellers can manage attribute values for their own listings"
  on public.listing_attribute_values for all
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_attribute_values.listing_id
        and listings.seller_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_attribute_values.listing_id
        and listings.seller_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- New top-level categories (Health & Beauty, Business & Industrial,
-- Antiques & Collectibles, Free Stuff)
-- ---------------------------------------------------------------------------
insert into public.categories (name, slug, icon) values
  ('Health & Beauty', 'health-beauty', 'heart-pulse'),
  ('Business & Industrial', 'business-industrial', 'factory'),
  ('Antiques & Collectibles', 'antiques-collectibles', 'gem'),
  ('Free Stuff', 'free-stuff', 'gift');

-- ---------------------------------------------------------------------------
-- Subcategories for every top-level category
-- ---------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicles'), name, slug
from (values
  ('Cars', 'cars'),
  ('Motorcycles & Scooters', 'motorcycles-scooters'),
  ('Commercial Vehicles & Trucks', 'commercial-trucks'),
  ('Construction & Heavy Equipment', 'construction-equipment'),
  ('Trailers', 'trailers'),
  ('Car Parts & Accessories', 'car-parts-accessories'),
  ('Motorcycle Parts & Accessories', 'motorcycle-parts-accessories'),
  ('Tyres & Rims', 'tyres-rims'),
  ('Car Audio & Electronics', 'car-audio-electronics'),
  ('Boats & Watercraft', 'boats-watercraft')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'real-estate'), name, slug
from (values
  ('Apartments for Sale', 'apartments-for-sale'),
  ('Apartments for Rent', 'apartments-for-rent'),
  ('Houses for Sale', 'houses-for-sale'),
  ('Houses for Rent', 'houses-for-rent'),
  ('Land & Plots', 'land-plots'),
  ('Commercial & Office Space', 'commercial-office-space'),
  ('Shops & Retail Space', 'shops-retail-space'),
  ('Warehouses & Godowns', 'warehouses-godowns'),
  ('Rooms & Shared Housing', 'rooms-shared-housing'),
  ('PG & Hostels', 'pg-hostels')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'electronics'), name, slug
from (values
  ('Mobile Phones', 'mobile-phones'),
  ('Tablets', 'tablets'),
  ('Laptops', 'laptops'),
  ('Desktop Computers', 'desktop-computers'),
  ('Computer Accessories', 'computer-accessories'),
  ('TVs', 'tvs'),
  ('Audio & Speakers', 'audio-speakers'),
  ('Cameras & Camcorders', 'cameras-camcorders'),
  ('Gaming Consoles & Games', 'gaming-consoles-games'),
  ('Smartwatches & Wearables', 'smartwatches-wearables'),
  ('Home Appliances', 'home-appliances')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-living'), name, slug
from (values
  ('Furniture', 'furniture'),
  ('Home Decor', 'home-decor'),
  ('Kitchenware', 'kitchenware'),
  ('Garden & Outdoor', 'garden-outdoor'),
  ('Bedding & Linens', 'bedding-linens'),
  ('Lighting', 'lighting'),
  ('Storage & Organization', 'storage-organization')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion'), name, slug
from (values
  ('Women''s Clothing', 'womens-clothing'),
  ('Men''s Clothing', 'mens-clothing'),
  ('Kids'' Clothing', 'kids-clothing'),
  ('Women''s Shoes', 'womens-shoes'),
  ('Men''s Shoes', 'mens-shoes'),
  ('Bags & Wallets', 'bags-wallets'),
  ('Watches', 'watches'),
  ('Jewelry', 'jewelry'),
  ('Traditional Wear', 'traditional-wear')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'jobs'), name, slug
from (values
  ('IT & Software', 'it-software'),
  ('Sales & Marketing', 'sales-marketing'),
  ('Customer Service', 'customer-service'),
  ('Driver', 'driver-jobs'),
  ('Construction & Labor', 'construction-labor'),
  ('Hospitality & Tourism', 'hospitality-tourism'),
  ('Healthcare', 'healthcare-jobs'),
  ('Education & Teaching', 'education-teaching'),
  ('Retail', 'retail-jobs'),
  ('Accounting & Finance', 'accounting-finance'),
  ('Domestic Help', 'domestic-help'),
  ('Internships', 'internships')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'services'), name, slug
from (values
  ('Home Repair & Maintenance', 'home-repair-maintenance'),
  ('Tutoring & Classes', 'tutoring-classes'),
  ('Event Services', 'event-services'),
  ('Beauty & Wellness Services', 'beauty-wellness-services'),
  ('Transport & Rental Services', 'transport-rental-services'),
  ('Professional Services', 'professional-services'),
  ('IT & Tech Services', 'it-tech-services'),
  ('Cleaning Services', 'cleaning-services')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'hobbies-sports'), name, slug
from (values
  ('Sports Equipment', 'sports-equipment'),
  ('Musical Instruments', 'musical-instruments'),
  ('Books & Magazines', 'books-magazines'),
  ('Toys & Games', 'toys-games'),
  ('Baby & Kids Gear', 'baby-kids-gear'),
  ('Bicycles', 'bicycles')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'pets'), name, slug
from (values
  ('Dogs', 'dogs'),
  ('Cats', 'cats'),
  ('Birds', 'birds'),
  ('Fish & Aquarium', 'fish-aquarium'),
  ('Pet Supplies & Accessories', 'pet-supplies-accessories'),
  ('Other Pets', 'other-pets')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Livestock', 'livestock'),
  ('Farm Equipment & Machinery', 'farm-equipment-machinery'),
  ('Seeds & Plants', 'seeds-plants'),
  ('Feed & Fertilizer', 'feed-fertilizer'),
  ('Dairy Products', 'dairy-products')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'health-beauty'), name, slug
from (values
  ('Cosmetics', 'cosmetics'),
  ('Skincare', 'skincare'),
  ('Health Equipment', 'health-equipment'),
  ('Fitness Equipment', 'fitness-equipment')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'business-industrial'), name, slug
from (values
  ('Office Equipment & Supplies', 'office-equipment-supplies'),
  ('Industrial Machinery', 'industrial-machinery'),
  ('Restaurant & Catering Equipment', 'restaurant-catering-equipment'),
  ('Industrial Supplies', 'industrial-supplies')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'antiques-collectibles'), name, slug
from (values
  ('Antiques', 'antiques'),
  ('Coins & Stamps', 'coins-stamps'),
  ('Art & Paintings', 'art-paintings'),
  ('Collectible Toys & Memorabilia', 'collectible-toys-memorabilia')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Category attributes (structured "parametry"-style filters) for the
-- highest-value top-level categories
-- ---------------------------------------------------------------------------
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'vehicles'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, true, 2),
  ('year', 'Year', 'number', null, false, 3),
  ('mileage_km', 'Mileage (km)', 'number', null, false, 4),
  ('fuel_type', 'Fuel Type', 'select', '["Petrol", "Diesel", "Electric", "Hybrid", "CNG"]', false, 5),
  ('transmission', 'Transmission', 'select', '["Manual", "Automatic"]', false, 6),
  ('body_type', 'Body Type', 'select', '["Sedan", "SUV", "Hatchback", "Van", "Truck", "Motorcycle", "Scooter", "Other"]', false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'real-estate'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('property_type', 'Property Type', 'select', '["Apartment", "House", "Land", "Office", "Shop", "Warehouse", "Room"]', true, 1),
  ('transaction_type', 'Transaction Type', 'select', '["Sale", "Rent"]', true, 2),
  ('area_sqft', 'Area (sq ft)', 'number', null, false, 3),
  ('rooms', 'Rooms', 'number', null, false, 4),
  ('floor', 'Floor', 'text', null, false, 5),
  ('furnished', 'Furnished', 'boolean', null, false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'electronics'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, false, 2),
  ('storage_ram', 'Storage / RAM', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'fashion'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('size', 'Size', 'text', null, false, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('color', 'Color', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'jobs'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('employment_type', 'Employment Type', 'select', '["Full-time", "Part-time", "Contract", "Internship"]', true, 1),
  ('work_mode', 'Work Mode', 'select', '["On-site", "Remote", "Hybrid"]', false, 2),
  ('experience_level', 'Experience Level', 'select', '["Entry level", "Mid level", "Senior level"]', false, 3),
  ('salary_range', 'Salary Range (NPR)', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
