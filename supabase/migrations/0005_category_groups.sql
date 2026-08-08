-- haatnepal: 3-tier category taxonomy (top-level -> grouped section -> leaf item)
-- for the 6 highest-traffic categories, matching Allegro's real structure.
-- Safe to run: verified zero listings reference any category touched here.

-- ---------------------------------------------------------------------------
-- Vehicles: keep listing-type children (Cars, Motorcycles & Scooters,
-- Commercial Vehicles & Trucks, Construction & Heavy Equipment, Trailers,
-- Boats & Watercraft), replace the "parts & accessories" leaves with groups.
-- ---------------------------------------------------------------------------
delete from public.categories
where slug in ('car-parts-accessories', 'motorcycle-parts-accessories', 'tyres-rims', 'car-audio-electronics');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicles'), name, slug
from (values
  ('Car Parts', 'car-parts'),
  ('Car Accessories', 'car-accessories'),
  ('Tyres & Rims', 'tyres-rims'),
  ('Workshop', 'vehicle-workshop'),
  ('Motorcycle Parts & Accessories', 'motorcycle-parts-group'),
  ('Chemicals', 'vehicle-chemicals'),
  ('Machine Parts', 'vehicle-machine-parts')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'car-parts'), name, slug
from (values
  ('Body Parts', 'body-parts'),
  ('Lighting', 'vehicle-lighting'),
  ('Engine & Equipment', 'engine-equipment'),
  ('Electrical & Ignition', 'electrical-ignition'),
  ('Braking System', 'braking-system'),
  ('Suspension System', 'suspension-system'),
  ('Cooling System', 'cooling-system'),
  ('Interior Equipment', 'interior-equipment')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'car-accessories'), name, slug
from (values
  ('Mats', 'car-mats'),
  ('Bulbs', 'car-bulbs'),
  ('Wiper Blades', 'wiper-blades'),
  ('Car Electronics', 'car-electronics')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tyres-rims'), name, slug
from (values
  ('Car Tyres', 'car-tyres'),
  ('Wheels (Tyres + Rims)', 'wheels-tyres-rims'),
  ('Alloy Rims', 'alloy-rims'),
  ('Steel Rims', 'steel-rims')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicle-workshop'), name, slug
from (values
  ('Tool Sets', 'vehicle-tool-sets'),
  ('Bodywork & Paint', 'bodywork-paint'),
  ('Impact Wrenches', 'impact-wrenches'),
  ('Workshop Tools', 'workshop-tools')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'motorcycle-parts-group'), name, slug
from (values
  ('Motorcycle Parts', 'motorcycle-parts'),
  ('Motorcycle Helmets', 'motorcycle-helmets'),
  ('Motorcycle Clothing', 'motorcycle-clothing'),
  ('Motorcycle Wheels', 'motorcycle-wheels')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicle-chemicals'), name, slug
from (values
  ('Engine Oils', 'engine-oils'),
  ('Cleaning & Care', 'vehicle-cleaning-care'),
  ('Operating Fluids', 'operating-fluids'),
  ('Bodywork Chemicals', 'bodywork-chemicals')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'vehicle-machine-parts'), name, slug
from (values
  ('Agricultural Machine Parts', 'agri-machine-parts'),
  ('Construction Machine Parts', 'construction-machine-parts'),
  ('Other Vehicle Parts', 'other-vehicle-parts')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Real Estate: full replace
-- ---------------------------------------------------------------------------
delete from public.categories
where parent_id = (select id from public.categories where slug = 'real-estate');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'real-estate'), name, slug
from (values
  ('For Sale', 'real-estate-for-sale'),
  ('For Rent', 'real-estate-for-rent'),
  ('Popular Property Types', 'popular-property-types')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'real-estate-for-sale'), name, slug
from (values
  ('Apartments for Sale', 'apartments-for-sale'),
  ('Houses for Sale', 'houses-for-sale'),
  ('Land for Sale', 'land-for-sale'),
  ('Commercial Units for Sale', 'commercial-units-for-sale'),
  ('Warehouses for Sale', 'warehouses-for-sale'),
  ('Garages for Sale', 'garages-for-sale')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'real-estate-for-rent'), name, slug
from (values
  ('Apartments for Rent', 'apartments-for-rent'),
  ('Houses for Rent', 'houses-for-rent'),
  ('Land for Rent', 'land-for-rent'),
  ('Commercial Units for Rent', 'commercial-units-for-rent'),
  ('Warehouses for Rent', 'warehouses-for-rent'),
  ('Rooms for Rent', 'rooms-for-rent')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'popular-property-types'), name, slug
from (values
  ('Row Houses', 'row-houses'),
  ('Semi-Detached Houses', 'semi-detached-houses'),
  ('Detached Houses', 'detached-houses'),
  ('Holiday Homes', 'holiday-homes')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Electronics: full replace
-- ---------------------------------------------------------------------------
delete from public.categories
where parent_id = (select id from public.categories where slug = 'electronics');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'electronics'), name, slug
from (values
  ('Phones & Accessories', 'phones-accessories'),
  ('Computers', 'computers-group'),
  ('TVs & Home Entertainment', 'tvs-entertainment'),
  ('Gaming Consoles', 'gaming-consoles-group'),
  ('Small Appliances', 'small-appliances'),
  ('Major Appliances', 'major-appliances'),
  ('Built-in Appliances', 'built-in-appliances'),
  ('Photography', 'photography-group')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'phones-accessories'), name, slug
from (values
  ('Smartphones', 'smartphones'),
  ('Smartwatches', 'smartwatches'),
  ('Tablets', 'electronics-tablets'),
  ('Mobile Accessories', 'mobile-accessories'),
  ('Cases & Covers', 'cases-covers')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'computers-group'), name, slug
from (values
  ('Laptops', 'laptops'),
  ('Laptop Parts', 'laptop-parts'),
  ('Desktop Computers', 'desktop-computers'),
  ('Computer Components', 'computer-components'),
  ('Printers & Scanners', 'printers-scanners')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tvs-entertainment'), name, slug
from (values
  ('Televisions', 'televisions'),
  ('Projectors', 'projectors'),
  ('Headphones', 'headphones'),
  ('Home Audio', 'home-audio'),
  ('Home Cinema', 'home-cinema')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'gaming-consoles-group'), name, slug
from (values
  ('PlayStation 5', 'playstation-5'),
  ('Xbox Series X/S', 'xbox-series'),
  ('PlayStation 4', 'playstation-4'),
  ('Xbox One', 'xbox-one'),
  ('Nintendo Switch', 'nintendo-switch')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'small-appliances'), name, slug
from (values
  ('Air Fryers', 'air-fryers'),
  ('Vacuum Cleaners', 'vacuum-cleaners'),
  ('Kitchen Gadgets', 'kitchen-gadgets'),
  ('Personal Care Appliances', 'personal-care-appliances')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'major-appliances'), name, slug
from (values
  ('Refrigerators', 'refrigerators'),
  ('Washing Machines', 'washing-machines'),
  ('Clothes Dryers', 'clothes-dryers'),
  ('Kitchen Sets', 'kitchen-sets')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'built-in-appliances'), name, slug
from (values
  ('Hotplates', 'hotplates'),
  ('Built-in Ovens', 'built-in-ovens'),
  ('Built-in Dishwashers', 'built-in-dishwashers'),
  ('Range Hoods', 'range-hoods')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'photography-group'), name, slug
from (values
  ('Digital Cameras', 'digital-cameras'),
  ('Lenses', 'camera-lenses'),
  ('Photo Accessories', 'photo-accessories'),
  ('Instant Cameras', 'instant-cameras')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Fashion: full replace
-- ---------------------------------------------------------------------------
delete from public.categories
where parent_id = (select id from public.categories where slug = 'fashion');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion'), name, slug
from (values
  ('Women', 'fashion-women'),
  ('Men', 'fashion-men'),
  ('Kids', 'fashion-kids')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-women'), name, slug
from (values
  ('Women''s Clothing', 'womens-clothing'),
  ('Women''s Shoes', 'womens-shoes'),
  ('Lingerie', 'lingerie'),
  ('Women''s Jewelry', 'womens-jewelry'),
  ('Sets', 'fashion-sets'),
  ('Jackets & Coats (Women)', 'womens-jackets-coats'),
  ('Dresses', 'dresses'),
  ('Handbags', 'handbags')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-men'), name, slug
from (values
  ('Men''s Clothing', 'mens-clothing'),
  ('Men''s Shoes', 'mens-shoes'),
  ('Men''s Underwear', 'mens-underwear'),
  ('Men''s Watches', 'mens-watches'),
  ('Jackets & Coats (Men)', 'mens-jackets-coats'),
  ('Men''s T-Shirts', 'mens-tshirts')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-kids'), name, slug
from (values
  ('Kids'' Clothing', 'kids-clothing'),
  ('Kids'' Shoes', 'kids-shoes'),
  ('Baby Clothes', 'baby-clothes'),
  ('Kids'' Underwear', 'kids-underwear'),
  ('Jackets & Coats (Kids)', 'kids-jackets-coats'),
  ('Pajamas', 'kids-pajamas')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Home & Living: full replace
-- ---------------------------------------------------------------------------
delete from public.categories
where parent_id = (select id from public.categories where slug = 'home-living');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-living'), name, slug
from (values
  ('Housewares', 'housewares'),
  ('Tools', 'home-tools'),
  ('Lighting', 'home-lighting-group'),
  ('Furniture', 'home-furniture'),
  ('Construction Materials', 'construction-materials'),
  ('Garden', 'home-garden-group')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'housewares'), name, slug
from (values
  ('Textiles', 'home-textiles'),
  ('Tableware', 'tableware'),
  ('Cookware', 'cookware'),
  ('Storage', 'home-storage')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-tools'), name, slug
from (values
  ('Hand Tools', 'hand-tools'),
  ('Power Tools', 'power-tools'),
  ('Toolboxes', 'toolboxes'),
  ('Measuring Instruments', 'measuring-instruments')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-lighting-group'), name, slug
from (values
  ('Interior Lighting', 'interior-lighting'),
  ('Garden Lighting', 'garden-lighting'),
  ('Kids'' Lighting', 'kids-lighting'),
  ('LED Bulbs', 'led-bulbs')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-furniture'), name, slug
from (values
  ('Living Room Furniture', 'living-room-furniture'),
  ('Bedroom Furniture', 'bedroom-furniture'),
  ('Kitchen Furniture', 'kitchen-furniture'),
  ('Furniture Accessories', 'furniture-accessories')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'construction-materials'), name, slug
from (values
  ('Ladders', 'ladders'),
  ('Bathroom Fixtures', 'bathroom-fixtures'),
  ('Electrical & Accessories', 'electrical-accessories'),
  ('Radiators', 'radiators')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'home-garden-group'), name, slug
from (values
  ('Grilling', 'grilling'),
  ('Pest Control', 'pest-control'),
  ('Garden Furniture', 'garden-furniture'),
  ('Lawn Equipment', 'lawn-equipment')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Hobbies & Sports: keep Musical Instruments and Books & Magazines as flat
-- children, replace the rest with groups.
-- ---------------------------------------------------------------------------
delete from public.categories
where slug in ('sports-equipment', 'toys-games', 'baby-kids-gear', 'bicycles');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'hobbies-sports'), name, slug
from (values
  ('Cycling', 'cycling-group'),
  ('Fishing', 'fishing-group'),
  ('Running', 'running-group'),
  ('Gym & Fitness', 'gym-fitness'),
  ('Kids & Baby', 'hobbies-kids-baby')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'cycling-group'), name, slug
from (values
  ('Bicycles', 'bicycles'),
  ('Bike Parts', 'bike-parts'),
  ('Cycling Helmets', 'cycling-helmets'),
  ('Cycling Clothing', 'cycling-clothing')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fishing-group'), name, slug
from (values
  ('Fishing Accessories', 'fishing-accessories'),
  ('Fishing Rods', 'fishing-rods'),
  ('Reels', 'fishing-reels'),
  ('Baits', 'fishing-baits')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'running-group'), name, slug
from (values
  ('Running Clothing', 'running-clothing'),
  ('Running Shoes', 'running-shoes'),
  ('Running Headphones', 'running-headphones'),
  ('Running Accessories', 'running-accessories')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'gym-fitness'), name, slug
from (values
  ('Supplements', 'supplements'),
  ('Workout Equipment', 'workout-equipment'),
  ('Gym Gear', 'gym-gear'),
  ('Protein Supplements', 'protein-supplements')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'hobbies-kids-baby'), name, slug
from (values
  ('Toys', 'toys'),
  ('Strollers', 'strollers'),
  ('School Supplies', 'school-supplies'),
  ('Feeding Supplies', 'feeding-supplies'),
  ('Diapers & Hygiene', 'diapers-hygiene')
) as t(name, slug);
