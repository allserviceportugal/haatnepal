-- haatnepal: Agriculture comprehensive overhaul
-- Transforms Agriculture from flat 2-tier (9 leaves) to 3-tier (13 groups → ~50 leaves)
-- Preserves all existing category IDs/slugs; promotes leaves to groups and adds children
-- Adds department-level fallback attributes + rich per-leaf attributes (Nepal-localized)
-- Matches the Food & Beverages Phase 1 pattern exactly (0025_food_beverages_comprehensive.sql)

-- ---------------------------------------------------------------------------
-- PHASE 1: PROMOTE EXISTING 9 LEAVES TO GROUPS (preserve IDs, add children)
-- ---------------------------------------------------------------------------

-- Agricultural Produce & Grains — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agricultural-produce-grains'), name, slug
from (values
  ('Rice', 'agricultural-rice'),
  ('Wheat', 'agricultural-wheat'),
  ('Maize', 'agricultural-maize'),
  ('Millet & Buckwheat', 'agricultural-millet-buckwheat'),
  ('Barley', 'agricultural-barley'),
  ('Pulses & Lentils', 'agricultural-pulses-lentils'),
  ('Oilseeds', 'agricultural-oilseeds'),
  ('Cash Crops (Tea, Coffee, Cardamom)', 'agricultural-cash-crops'),
  ('Raw Herbs & Spices', 'agricultural-raw-herbs-spices'),
  ('Other Grains & Produce', 'agricultural-other-grains')
) as t(name, slug);

-- Fruits & Vegetables — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fruits-vegetables'), name, slug
from (values
  ('Fruits', 'agricultural-fruits'),
  ('Vegetables', 'agricultural-vegetables'),
  ('Mushrooms & Other Produce', 'agricultural-mushrooms-other')
) as t(name, slug);

-- Dairy Products — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'dairy-products'), name, slug
from (values
  ('Milk', 'agricultural-milk'),
  ('Ghee & Butter', 'agricultural-ghee-butter'),
  ('Cheese & Paneer', 'agricultural-cheese-paneer'),
  ('Yogurt & Chhurpi', 'agricultural-yogurt-chhurpi'),
  ('Other Dairy Products', 'agricultural-other-dairy')
) as t(name, slug);

-- Livestock — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'livestock'), name, slug
from (values
  ('Cattle', 'agricultural-cattle'),
  ('Buffalo', 'agricultural-buffalo'),
  ('Goat & Sheep', 'agricultural-goat-sheep'),
  ('Pigs', 'agricultural-pigs'),
  ('Poultry & Birds', 'agricultural-poultry-birds'),
  ('Rabbits', 'agricultural-rabbits'),
  ('Fish & Fingerlings', 'agricultural-fish-fingerlings'),
  ('Bees & Beekeeping', 'agricultural-bees-beekeeping'),
  ('Other Livestock', 'agricultural-other-livestock')
) as t(name, slug);

-- Seeds & Plants — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'seeds-plants'), name, slug
from (values
  ('Vegetable Seeds', 'agricultural-vegetable-seeds'),
  ('Fruit Seeds & Saplings', 'agricultural-fruit-seeds-saplings'),
  ('Grain & Pulse Seeds', 'agricultural-grain-pulse-seeds'),
  ('Flower & Ornamental Seeds', 'agricultural-flower-ornamental-seeds'),
  ('Herb Seeds', 'agricultural-herb-seeds'),
  ('Seedlings & Nursery Plants', 'agricultural-seedlings-nursery')
) as t(name, slug);

-- Feed & Fertilizer — rename to "Feed & Animal Nutrition" (keep slug)
update public.categories set name = 'Feed & Animal Nutrition' where slug = 'feed-fertilizer';

-- Feed & Animal Nutrition — add children (under the renamed feed-fertilizer)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'feed-fertilizer'), name, slug
from (values
  ('Cattle & Buffalo Feed', 'agricultural-cattle-buffalo-feed'),
  ('Poultry Feed', 'agricultural-poultry-feed'),
  ('Goat & Sheep Feed', 'agricultural-goat-sheep-feed'),
  ('Fish Feed', 'agricultural-fish-feed'),
  ('Animal Supplements & Minerals', 'agricultural-animal-supplements'),
  ('Fodder, Hay, Straw & Bhusa', 'agricultural-fodder-hay-straw')
) as t(name, slug);

-- Farm Equipment & Machinery — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'farm-equipment-machinery'), name, slug
from (values
  ('Power Tillers & Rotavators', 'agricultural-power-tillers'),
  ('Ploughs, Cultivators & Seeders', 'agricultural-ploughs-cultivators'),
  ('Harvesters & Threshers', 'agricultural-harvesters-threshers'),
  ('Chaff Cutters & Feed Grinders', 'agricultural-chaff-cutters'),
  ('Sprayers & Brush Cutters', 'agricultural-sprayers-brush-cutters'),
  ('Milking Machines & Dairy Equipment', 'agricultural-milking-machines'),
  ('Poultry Equipment', 'agricultural-poultry-equipment'),
  ('Hand Tools & Storage Equipment', 'agricultural-hand-tools-storage')
) as t(name, slug);

-- Irrigation Equipment & Accessories — add children
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'irrigation-equipment-accessories'), name, slug
from (values
  ('Water Pumps', 'agricultural-water-pumps'),
  ('Drip & Sprinkler Irrigation', 'agricultural-drip-sprinkler'),
  ('Pipes, Hoses & Valves', 'agricultural-pipes-hoses-valves'),
  ('Water Tanks & Storage', 'agricultural-water-tanks-storage')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- PHASE 2: INSERT NEW GROUPS + THEIR LEAVES
-- ---------------------------------------------------------------------------

-- Fertilizer & Soil Inputs (NEW GROUP)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Fertilizer & Soil Inputs', 'fertilizer-soil-inputs')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fertilizer-soil-inputs'), name, slug
from (values
  ('Chemical Fertilizer', 'agricultural-chemical-fertilizer'),
  ('Organic Fertilizer & Compost', 'agricultural-organic-fertilizer'),
  ('Biofertilizer & Micronutrients', 'agricultural-biofertilizer'),
  ('Soil Conditioners & Lime', 'agricultural-soil-conditioners')
) as t(name, slug);

-- Crop Protection (NEW GROUP)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Crop Protection', 'crop-protection')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'crop-protection'), name, slug
from (values
  ('Pesticides & Insecticides', 'agricultural-pesticides'),
  ('Fungicides & Herbicides', 'agricultural-fungicides'),
  ('Bio-Pesticides & Organic Pest Control', 'agricultural-bio-pesticides'),
  ('Sprayers, Traps & Accessories', 'agricultural-crop-protection-accessories')
) as t(name, slug);

-- Greenhouse & Protected Agriculture (NEW GROUP)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Greenhouse & Protected Agriculture', 'greenhouse-protected-agriculture')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'greenhouse-protected-agriculture'), name, slug
from (values
  ('Greenhouses & Polyhouses', 'agricultural-greenhouses'),
  ('Shade & Insect Nets', 'agricultural-shade-insect-nets'),
  ('Growing Media & Hydroponics', 'agricultural-growing-media'),
  ('Nursery Trays & Grow Bags', 'agricultural-nursery-trays')
) as t(name, slug);

-- Agricultural Services (NEW GROUP)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Agricultural Services', 'agricultural-services')
) as t(name, slug);

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agricultural-services'), name, slug
from (values
  ('Soil Testing & Consultancy', 'agricultural-soil-testing'),
  ('Veterinary & Livestock Services', 'agricultural-veterinary-services'),
  ('Machinery & Tractor Services', 'agricultural-machinery-services'),
  ('Spraying, Ploughing & Harvesting Services', 'agricultural-field-services'),
  ('Irrigation & Greenhouse Installation', 'agricultural-irrigation-installation'),
  ('Transport, Cold Storage & Warehousing', 'agricultural-storage-transport')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- PHASE 3: DEPARTMENT-LEVEL FALLBACK ATTRIBUTES
-- ---------------------------------------------------------------------------

-- Universal agriculture attributes for every Agriculture listing
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agriculture'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Unbranded", "Local Producer", "Company", "Cooperative", "Other"]', false, 1),
  ('quantity_unit', 'Unit of Sale', 'select', '["kg", "g", "quintal", "ton", "litre", "ml", "piece", "dozen", "crate", "sack", "bag", "bundle", "tray", "box", "bale", "animal", "bird", "hour", "day"]', false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- PHASE 4: LEAF-SPECIFIC ATTRIBUTES
-- ---------------------------------------------------------------------------

-- GRAINS & CEREALS --

-- Rice
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-rice'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Variety', 'select', '["Mansuli", "Basmati", "Jetho Budho", "Anadi", "Sona Mansuli", "Saya Marwa", "Mixed", "Other"]', true, 1),
  ('grade', 'Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 2),
  ('crop_year', 'Crop Year', 'number', null, false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4),
  ('packaging', 'Packaging', 'select', '["Jute Sack", "Plastic Bag", "Gunny Bag", "Bulk", "Other"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Wheat
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-wheat'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Variety', 'select', '["Local Red", "White Wheat", "Local Mixed", "Other"]', true, 1),
  ('grade', 'Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 2),
  ('crop_year', 'Crop Year', 'number', null, false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4),
  ('processing_type', 'Processing Type', 'select', '["Whole Grain", "Milled", "Cracked", "Other"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Maize
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-maize'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Variety', 'select', '["Yellow Maize", "White Maize", "Hybrid", "Local", "Other"]', true, 1),
  ('grade', 'Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 2),
  ('crop_year', 'Crop Year', 'number', null, false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Millet & Buckwheat
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-millet-buckwheat'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Type', 'select', '["Finger Millet (Kodo)", "Foxtail Millet (Kauni)", "Buckwheat (Phaphar)", "Mixed", "Other"]', true, 1),
  ('crop_year', 'Crop Year', 'number', null, false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Barley
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-barley'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Variety', 'select', '["Two-Row", "Six-Row", "Local", "Other"]', false, 1),
  ('crop_year', 'Crop Year', 'number', null, false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Pulses & Lentils
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-pulses-lentils'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('pulse_type', 'Pulse Type', 'select', '["Red Lentil (Masur)", "Black Lentil (Urad)", "Chickpea (Chana)", "Kidney Bean", "Mung Bean", "Peas", "Mixed Dal", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Whole", "Split", "Ground", "Mixed", "Other"]', false, 2),
  ('grade', 'Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Oilseeds
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-oilseeds'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('variety', 'Type', 'select', '["Sunflower", "Sesame (Til)", "Mustard (Rai)", "Soybean", "Groundnut", "Other"]', true, 1),
  ('crop_year', 'Crop Year', 'number', null, false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cash Crops
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-cash-crops'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('crop_type', 'Crop Type', 'select', '["Tea", "Coffee", "Cardamom", "Turmeric", "Ginger", "Other"]', true, 1),
  ('crop_year', 'Crop Year', 'number', null, false, 2),
  ('origin_region', 'Origin Region (e.g., Ilam, Gulmi)', 'text', null, false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Raw Herbs & Spices
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-raw-herbs-spices'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('spice_type', 'Spice Type', 'select', '["Turmeric", "Chili", "Cumin", "Coriander", "Fenugreek", "Timur (Sichuan Pepper)", "Asafoetida", "Mixed", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Whole", "Ground/Powder", "Seeds", "Other"]', false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- FRUITS --

-- Fruits (general)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-fruits'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('fruit_type', 'Fruit Type', 'select', '["Apple", "Mandarin", "Orange", "Mango", "Banana", "Guava", "Kiwi", "Litchi", "Pomegranate", "Peach", "Strawberry", "Papaya", "Avocado", "Mixed", "Other"]', true, 1),
  ('grade', 'Grade/Size', 'select', '["Premium", "A-Grade", "B-Grade", "Mixed", "Other"]', false, 2),
  ('freshness', 'Freshness', 'select', '["Very Fresh", "Fresh", "Ripe", "Other"]', false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4),
  ('origin_region', 'Origin (e.g., Mustang, Ilam)', 'text', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- VEGETABLES --

-- Vegetables (general)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-vegetables'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('vegetable_type', 'Vegetable Type', 'select', '["Potato", "Tomato", "Onion", "Garlic", "Ginger", "Cabbage", "Cauliflower", "Broccoli", "Carrot", "Radish", "Cucumber", "Pumpkin", "Bitter Gourd", "Okra", "Brinjal", "Capsicum", "Green Chilli", "Akabare Chilli", "Leafy Vegetables", "Mixed", "Other"]', true, 1),
  ('grade', 'Grade', 'select', '["Premium", "A-Grade", "B-Grade", "Mixed", "Other"]', false, 2),
  ('freshness', 'Freshness', 'select', '["Very Fresh (Today)", "Fresh", "1-2 Days Old", "Other"]', false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4),
  ('origin_region', 'Origin/Region', 'text', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- MUSHROOMS --

-- Mushrooms & Other Produce
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-mushrooms-other'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Button Mushroom", "Shiitake", "Oyster", "Paddy Straw Mushroom", "Other"]', true, 1),
  ('freshness', 'Freshness', 'select', '["Very Fresh", "Fresh", "Other"]', false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- DAIRY --

-- Milk
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-milk'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('source_animal', 'Source Animal', 'select', '["Cow Milk", "Buffalo Milk", "Goat Milk", "Mixed", "Other"]', true, 1),
  ('freshness', 'Freshness', 'select', '["Fresh/Raw", "Pasteurized", "Boiled", "Other"]', false, 2),
  ('fat_content', 'Fat Content (approx %)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Ghee & Butter
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-ghee-butter'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Ghee (Clarified Butter)", "Butter", "Mixed", "Other"]', true, 1),
  ('source_animal', 'Source Animal', 'select', '["Cow", "Buffalo", "Goat", "Mixed", "Other"]', false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3),
  ('packaging', 'Packaging', 'select', '["Glass Jar", "Tin", "Plastic Container", "Bulk", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cheese & Paneer
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-cheese-paneer'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Paneer", "Cheese", "Mixed", "Other"]', true, 1),
  ('source_animal', 'Source Animal', 'select', '["Cow", "Buffalo", "Goat", "Mixed", "Other"]', false, 2),
  ('freshness', 'Freshness Status', 'select', '["Very Fresh", "Fresh", "Other"]', false, 3),
  ('organic', 'Organic', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Yogurt & Chhurpi
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-yogurt-chhurpi'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Yogurt (Dahi)", "Chhurpi", "Mixed", "Other"]', true, 1),
  ('source_animal', 'Source Animal', 'select', '["Cow", "Buffalo", "Goat", "Mixed", "Other"]', false, 2),
  ('freshness', 'Freshness', 'select', '["Very Fresh", "Fresh", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- LIVESTOCK --

-- Cattle
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-cattle'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('breed', 'Breed', 'select', '["Local Cow", "Jersey", "Holstein Friesian", "Sahiwal", "Mixed Breed", "Other"]', true, 1),
  ('age_months', 'Age (months)', 'number', null, true, 2),
  ('sex', 'Sex', 'select', '["Male", "Female"]', true, 3),
  ('purpose', 'Purpose', 'select', '["Dairy", "Breeding", "Meat", "Draught", "Pet", "Mixed Purpose", "Other"]', false, 4),
  ('vaccinated', 'Vaccinated', 'boolean', null, false, 5),
  ('lactating', 'Lactating (if female)', 'boolean', null, false, 6),
  ('milk_yield_liters', 'Daily Milk Yield (liters, if applicable)', 'text', null, false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

-- Buffalo
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-buffalo'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('breed', 'Breed', 'select', '["Murrah", "Local Hill Buffalo", "Mixed Breed", "Other"]', true, 1),
  ('age_months', 'Age (months)', 'number', null, true, 2),
  ('sex', 'Sex', 'select', '["Male", "Female"]', true, 3),
  ('purpose', 'Purpose', 'select', '["Dairy", "Breeding", "Meat", "Draught", "Other"]', false, 4),
  ('vaccinated', 'Vaccinated', 'boolean', null, false, 5),
  ('lactating', 'Lactating (if female)', 'boolean', null, false, 6),
  ('milk_yield_liters', 'Daily Milk Yield (liters, if applicable)', 'text', null, false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

-- Goat & Sheep
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-goat-sheep'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('animal_type', 'Animal Type', 'select', '["Goat", "Sheep", "Mixed"]', true, 1),
  ('breed', 'Breed', 'select', '["Local", "Improved", "Mixed", "Other"]', false, 2),
  ('age_months', 'Age (months)', 'number', null, true, 3),
  ('sex', 'Sex', 'select', '["Male", "Female"]', true, 4),
  ('purpose', 'Purpose', 'select', '["Dairy", "Meat", "Wool (Sheep)", "Breeding", "Pet", "Other"]', false, 5),
  ('vaccinated', 'Vaccinated', 'boolean', null, false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

-- Pigs
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-pigs'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('breed', 'Breed', 'select', '["Large Black", "Duroc", "Local", "Mixed", "Other"]', false, 1),
  ('age_months', 'Age (months)', 'number', null, true, 2),
  ('sex', 'Sex', 'select', '["Male", "Female"]', true, 3),
  ('purpose', 'Purpose', 'select', '["Meat", "Breeding", "Pet", "Other"]', false, 4),
  ('vaccinated', 'Vaccinated', 'boolean', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Poultry & Birds
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-poultry-birds'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('bird_type', 'Bird Type', 'select', '["Chicken", "Duck", "Goose", "Turkey", "Quail", "Other"]', true, 1),
  ('breed', 'Breed', 'select', '["Layer", "Broiler", "Local", "Mixed", "Other"]', false, 2),
  ('age_weeks', 'Age (weeks)', 'number', null, false, 3),
  ('quantity', 'Quantity', 'number', null, false, 4),
  ('purpose', 'Purpose', 'select', '["Egg Production", "Meat", "Pet", "Breeding", "Other"]', false, 5),
  ('vaccinated', 'Vaccinated', 'boolean', null, false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

-- Seeds --

-- Vegetable Seeds
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-vegetable-seeds'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('crop', 'Crop', 'text', null, true, 1),
  ('variety', 'Variety', 'text', null, false, 2),
  ('seed_type', 'Seed Type', 'select', '["Hybrid", "Open-Pollinated", "Local/Desi", "Organic", "Other"]', false, 3),
  ('brand', 'Brand/Producer', 'text', null, false, 4),
  ('planting_season', 'Planting Season', 'select', '["Pre-Monsoon", "Monsoon", "Winter", "Year-Round", "Other"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Grain & Pulse Seeds
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-grain-pulse-seeds'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('crop', 'Crop', 'select', '["Rice", "Wheat", "Maize", "Millet", "Lentil", "Bean", "Pea", "Other"]', true, 1),
  ('variety', 'Variety', 'text', null, false, 2),
  ('seed_type', 'Seed Type', 'select', '["Hybrid", "Open-Pollinated", "Local", "Organic", "Other"]', false, 3),
  ('brand', 'Brand/Producer', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Feed --

-- Cattle & Buffalo Feed
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-cattle-buffalo-feed'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('feed_type', 'Feed Type', 'select', '["Pellet", "Mash", "Crumble", "Loose Mix", "Other"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('weight_kg', 'Pack Weight (kg)', 'number', null, false, 3),
  ('composition', 'Primary Composition', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Poultry Feed
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-poultry-feed'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('feed_type', 'Feed Type', 'select', '["Pellet", "Crumble", "Mash", "Loose Mix", "Other"]', true, 1),
  ('bird_type', 'For Bird Type', 'select', '["Layer", "Broiler", "All Birds", "Other"]', false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('weight_kg', 'Pack Weight (kg)', 'number', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Fertilizer --

-- Chemical Fertilizer
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-chemical-fertilizer'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('fertilizer_type', 'Fertilizer Type', 'select', '["Urea", "DAP", "Potash", "NPK 10-10-10", "NPK 15-15-15", "NPK 20-20-20", "Single Superphosphate", "Other"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('weight_kg', 'Pack Weight (kg)', 'number', null, false, 3),
  ('form', 'Form', 'select', '["Granular", "Powder", "Liquid", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Organic Fertilizer & Compost
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-organic-fertilizer'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('fertilizer_type', 'Type', 'select', '["Compost", "Vermicompost", "Farmyard Manure", "Bone Meal", "Blood Meal", "Seaweed", "Mixed Organic", "Other"]', true, 1),
  ('brand', 'Brand/Producer', 'text', null, false, 2),
  ('weight_kg', 'Pack Weight (kg)', 'number', null, false, 3),
  ('organic_certified', 'Certified Organic', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Crop Protection --

-- Pesticides & Insecticides
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-pesticides'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Insecticide", "Pesticide", "Mixed", "Other"]', true, 1),
  ('active_ingredient', 'Active Ingredient (e.g., Lambda-Cyhalothrin)', 'text', null, false, 2),
  ('target_pest', 'Target Pest/Crop', 'text', null, false, 3),
  ('brand', 'Brand', 'text', null, false, 4),
  ('pack_size', 'Pack Size (ml/g)', 'text', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Fungicides & Herbicides
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-fungicides'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Fungicide", "Herbicide", "Mixed", "Other"]', true, 1),
  ('active_ingredient', 'Active Ingredient', 'text', null, false, 2),
  ('target_crop_disease', 'Target Crop/Disease', 'text', null, false, 3),
  ('brand', 'Brand', 'text', null, false, 4),
  ('pack_size', 'Pack Size (ml/g)', 'text', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Bio-Pesticides & Organic Pest Control
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-bio-pesticides'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Bio-Pesticide", "Organic Insecticide", "Neem Oil", "Trap/Barrier", "Other"]', true, 1),
  ('active_ingredient', 'Key Ingredient/Organism', 'text', null, false, 2),
  ('target_pest', 'Target Pest', 'text', null, false, 3),
  ('brand', 'Brand', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Machinery --

-- Power Tillers & Rotavators
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-power-tillers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, false, 2),
  ('year', 'Year', 'number', null, false, 3),
  ('power_hp', 'Power (HP)', 'number', null, false, 4),
  ('fuel_type', 'Fuel Type', 'select', '["Diesel", "Petrol", "Electric", "Manual", "Other"]', false, 5),
  ('hours_used', 'Hours Used (if applicable)', 'number', null, false, 6),
  ('condition_detail', 'Condition', 'select', '["New", "Used", "Refurbished"]', false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

-- Harvesters & Threshers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-harvesters-threshers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, true, 1),
  ('model', 'Model', 'text', null, false, 2),
  ('year', 'Year', 'number', null, false, 3),
  ('capacity_per_hour', 'Capacity (kg/hour, approx)', 'text', null, false, 4),
  ('fuel_type', 'Fuel Type', 'select', '["Diesel", "Electric", "Manual", "Other"]', false, 5),
  ('hours_used', 'Hours Used', 'number', null, false, 6),
  ('condition_detail', 'Condition', 'select', '["New", "Used", "Refurbished"]', false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

-- Irrigation --

-- Water Pumps (enhance existing irrigation attributes)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-water-pumps'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('pump_type', 'Pump Type', 'select', '["Submersible", "Surface (Centrifugal)", "Piston", "Gear", "Other"]', true, 1),
  ('power_source', 'Power Source', 'select', '["Electric", "Diesel", "Petrol", "Solar", "Manual"]', true, 2),
  ('power_hp', 'Power (HP)', 'number', null, false, 3),
  ('capacity', 'Capacity (liters/hour, approx)', 'text', null, false, 4),
  ('brand', 'Brand', 'text', null, false, 5),
  ('year', 'Year', 'number', null, false, 6),
  ('condition_detail', 'Condition', 'select', '["New", "Used", "Refurbished"]', false, 7)
) as t(key, label, input_type, options, is_required, sort_order);

-- Drip & Sprinkler Irrigation
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-drip-sprinkler'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('system_type', 'System Type', 'select', '["Drip Irrigation", "Sprinkler System", "Micro-sprinkler", "Mixed", "Other"]', true, 1),
  ('coverage_area_sqm', 'Coverage Area (sq meter)', 'text', null, false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('condition_detail', 'Condition', 'select', '["New", "Used", "Refurbished"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Greenhouse & Protected Agriculture --

-- Greenhouses & Polyhouses
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-greenhouses'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Greenhouse", "Polyhouse", "Shade House", "Other"]', true, 1),
  ('size_length_m', 'Length (meters)', 'text', null, false, 2),
  ('size_width_m', 'Width (meters)', 'text', null, false, 3),
  ('material', 'Material', 'select', '["Glass", "Polythene", "Shade Cloth", "Other"]', false, 4),
  ('brand', 'Brand/Manufacturer', 'text', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Agricultural Services --

-- Soil Testing & Consultancy
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-soil-testing'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Soil Testing", "Crop Advisory", "Farm Consultancy", "Organic Certification", "Other"]', true, 1),
  ('rate_unit', 'Charging Unit', 'select', '["Per Test/Sample", "Per Hectare", "Per Day", "Per Hour", "Other"]', false, 2),
  ('service_area', 'Service Area (Districts/Regions)', 'text', null, false, 3),
  ('provider_type', 'Provider Type', 'select', '["Individual Expert", "Agricultural Company", "NGO/Organization", "Government", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Veterinary & Livestock Services
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-veterinary-services'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Veterinary Checkup", "Vaccination", "Artificial Insemination", "Breeding Consultation", "Treatment", "Other"]', true, 1),
  ('rate_unit', 'Charging Unit', 'select', '["Per Animal", "Per Hour", "Per Visit", "Per Day", "Other"]', false, 2),
  ('service_area', 'Service Area', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Machinery & Tractor Services
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-machinery-services'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Machinery Rental", "Tractor Service", "Repair", "Maintenance", "Other"]', true, 1),
  ('equipment', 'Equipment Type', 'text', null, false, 2),
  ('rate_unit', 'Charging Unit', 'select', '["Per Hour", "Per Day", "Per Hectare", "Per Job", "Other"]', false, 3),
  ('service_area', 'Service Area', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Field Services
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-field-services'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Ploughing", "Spraying", "Harvesting", "Threshing", "Other"]', true, 1),
  ('rate_unit', 'Charging Unit', 'select', '["Per Hectare", "Per Ropani", "Per Day", "Per Hour", "Other"]', false, 2),
  ('equipment_included', 'Equipment Included', 'boolean', null, false, 3),
  ('service_area', 'Service Area', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Irrigation & Greenhouse Installation
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-irrigation-installation'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Irrigation System Installation", "Greenhouse Setup", "Drip/Sprinkler Installation", "Maintenance", "Other"]', true, 1),
  ('rate_unit', 'Charging Unit', 'select', '["Per System", "Per Hectare", "Per Day", "Per Hour", "Other"]', false, 2),
  ('service_area', 'Service Area', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Storage & Transport Services
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-storage-transport'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Service Type', 'select', '["Cold Storage", "Warehousing", "Transport/Logistics", "Mixed Storage & Transport", "Other"]', true, 1),
  ('rate_unit', 'Charging Unit', 'select', '["Per Quintal/Month", "Per Day", "Per Ton", "Per Trip", "Other"]', false, 2),
  ('storage_capacity', 'Storage Capacity (approximate)', 'text', null, false, 3),
  ('service_area', 'Service Area', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- PHASE 5: ENRICH EXISTING "Meats, Poultry & Fish" LEAF
-- ---------------------------------------------------------------------------

-- Add more attributes to the existing meats-poultry-fish leaf to complement the current 3
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'meats-poultry-fish'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('cut_type', 'Cut Type', 'select', '["Whole", "Half", "Pieces", "Ground/Minced", "Steak", "Mixed", "Other"]', false, 4),
  ('fresh_status', 'Fresh/Processed', 'select', '["Fresh", "Frozen", "Processed", "Live Animal", "Other"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);
