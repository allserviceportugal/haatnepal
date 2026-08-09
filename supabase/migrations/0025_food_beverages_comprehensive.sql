-- haatnepal: Food & Beverages comprehensive overhaul
-- Complete Food & Beverages taxonomy (Nepal-optimized) with Allegro-quality attributes
-- Supports packaged food, fresh produce, meat, dairy, homemade food, and Nepalese staples
-- Creates a 4-tier structure: Department → Group → Category → Leaf with dynamic attributes

-- ---------------------------------------------------------------------------
-- PHASE 1: DELETE OLD FOOD & BEVERAGES STRUCTURE AND REBUILD TAXONOMY
-- ---------------------------------------------------------------------------

-- Delete existing Food & Beverages children (keeping top-level for backward compat)
delete from public.categories
where parent_id = (select id from public.categories where slug = 'food-beverages');

-- Delete department-level attributes we're replacing
delete from public.category_attributes
where category_id = (select id from public.categories where slug = 'food-beverages');

-- ---------------------------------------------------------------------------
-- PHASE 2: TIER 1 - MAIN FOOD GROUPS (under Food & Beverages)
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-beverages'), name, slug
from (values
  ('Grocery & Staples', 'food-grocery-staples'),
  ('Fresh Produce', 'food-fresh-produce'),
  ('Meat, Fish & Seafood', 'food-meat-seafood'),
  ('Dairy & Eggs', 'food-dairy-eggs'),
  ('Bakery & Bread', 'food-bakery-bread'),
  ('Snacks & Savory', 'food-snacks-savory'),
  ('Sweets & Desserts', 'food-sweets-desserts'),
  ('Beverages', 'food-beverages-drinks'),
  ('Homemade & Artisan', 'food-homemade-artisan'),
  ('Nepali & Local Products', 'food-nepali-local')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL A: Grocery & Staples subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-grocery-staples'), name, slug
from (values
  ('Rice & Grains', 'food-rice-grains'),
  ('Flour & Baking', 'food-flour-baking'),
  ('Pulses & Lentils', 'food-pulses-lentils'),
  ('Cooking Oils & Ghee', 'food-oils-ghee'),
  ('Spices & Seasonings', 'food-spices-seasonings'),
  ('Pickles & Preserves', 'food-pickles-preserves'),
  ('Sauces & Condiments', 'food-sauces-condiments'),
  ('Dry Fruits & Nuts', 'food-dry-fruits-nuts')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL B: Fresh Produce subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-fresh-produce'), name, slug
from (values
  ('Vegetables', 'food-vegetables'),
  ('Fruits', 'food-fruits'),
  ('Herbs & Greens', 'food-herbs-greens')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL C: Meat, Fish & Seafood subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-meat-seafood'), name, slug
from (values
  ('Meat (Chicken, Goat, etc.)', 'food-meat-poultry'),
  ('Fish & Seafood', 'food-fish-seafood'),
  ('Processed Meat (Bacon, Sausage)', 'food-processed-meat')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL D: Dairy & Eggs subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-dairy-eggs'), name, slug
from (values
  ('Milk & Milk Products', 'food-milk-products'),
  ('Cheese & Paneer', 'food-cheese-paneer'),
  ('Ghee & Butter', 'food-ghee-butter'),
  ('Eggs', 'food-eggs'),
  ('Yogurt & Dahi', 'food-yogurt-dahi')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL E: Bakery & Bread subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-bakery-bread'), name, slug
from (values
  ('Bread & Rolls', 'food-bread-rolls'),
  ('Cakes & Pastries', 'food-cakes-pastries'),
  ('Cookies & Biscuits', 'food-cookies-biscuits')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL F: Snacks & Savory subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-snacks-savory'), name, slug
from (values
  ('Chips & Crisps', 'food-chips-crisps'),
  ('Savory Snacks', 'food-savory-snacks'),
  ('Roasted Nuts & Namkeen', 'food-roasted-nuts')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL G: Sweets & Desserts subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-sweets-desserts'), name, slug
from (values
  ('Mithai & Indian Sweets', 'food-mithai'),
  ('Chocolates & Confectionery', 'food-chocolates'),
  ('Ice Cream & Frozen Desserts', 'food-ice-cream')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL H: Beverages subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-beverages-drinks'), name, slug
from (values
  ('Tea & Coffee', 'food-tea-coffee'),
  ('Juices & Drinks', 'food-juices-drinks'),
  ('Soft Drinks & Sodas', 'food-soft-drinks'),
  ('Water & Sports Drinks', 'food-water-sports-drinks'),
  ('Alcoholic Beverages', 'food-alcoholic-beverages')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL I: Homemade & Artisan subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-homemade-artisan'), name, slug
from (values
  ('Homemade Food Preparations', 'food-homemade-prep'),
  ('Artisan Food Products', 'food-artisan-products'),
  ('Ready-to-Eat Meals', 'food-ready-to-eat'),
  ('Food Gifts & Hampers', 'food-gift-hampers')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- TIER 2 LEVEL J: Nepali & Local Products subcategories
-- ---------------------------------------------------------------------------

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-nepali-local'), name, slug
from (values
  ('Traditional Nepali Foods', 'food-traditional-nepali'),
  ('Local Crops & Produce', 'food-local-crops'),
  ('Organic & Farmers Market', 'food-organic-farmers'),
  ('Regional Specialty Foods', 'food-regional-specialty')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- PHASE 3: DEPARTMENT-LEVEL FALLBACK ATTRIBUTES (inherited by all leaves)
-- ---------------------------------------------------------------------------

-- Universal food attributes for every Food & Beverages listing
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-beverages'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Unbranded", "Homemade", "Local Producer", "Other"]', false, 1),
  ('quantity_value', 'Quantity', 'number', null, false, 2),
  ('quantity_unit', 'Unit', 'select', '["g", "kg", "ml", "L", "piece", "dozen", "packet", "box", "jar", "can", "bottle", "carton", "bundle", "other"]', false, 3),
  ('vegetarian', 'Vegetarian', 'boolean', null, false, 4),
  ('vegan', 'Vegan', 'boolean', null, false, 5),
  ('organic', 'Organic', 'boolean', null, false, 6),
  ('homemade', 'Homemade', 'boolean', null, false, 7),
  ('best_before_date', 'Best Before', 'text', null, false, 8),
  ('manufacturing_date', 'Manufacturing Date', 'text', null, false, 9),
  ('country_origin', 'Country of Origin', 'text', null, false, 10)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- PHASE 4: TIER 3 LEAF-SPECIFIC ATTRIBUTES
-- ---------------------------------------------------------------------------

-- Rice & Grains
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-rice-grains'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('grain_type', 'Grain Type', 'select', '["Basmati Rice", "Jasmine Rice", "Brown Rice", "White Rice", "Parboiled Rice", "Aromatic Rice", "Wheat", "Millet", "Buckwheat", "Maize", "Other"]', true, 1),
  ('variety', 'Variety/Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 2),
  ('pack_size', 'Pack Size', 'number', null, false, 3),
  ('milling_type', 'Milling Type', 'select', '["Single Polish", "Double Polish", "Automatic", "Traditional", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Flour & Baking
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-flour-baking'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('flour_type', 'Flour Type', 'select', '["Wheat Flour", "Maida", "Besan (Chickpea)", "Corn Flour", "Rice Flour", "Almond Flour", "Coconut Flour", "Other"]', true, 1),
  ('protein_content', 'Protein Content (%)', 'text', null, false, 2),
  ('pack_size', 'Pack Size', 'number', null, false, 3),
  ('baking_use', 'Recommended Use', 'select', '["Bread", "Cakes", "Pastries", "All-purpose", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Pulses & Lentils
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-pulses-lentils'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('pulse_type', 'Pulse Type', 'select', '["Red Lentil (Masur)", "Black Lentil (Urad)", "Chickpea (Chana)", "Kidney Bean", "Mung Bean", "Peas", "Mixed Dal", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Whole", "Split", "Ground", "Mixed", "Other"]', false, 2),
  ('pack_size', 'Pack Size', 'number', null, false, 3),
  ('quality', 'Quality Grade', 'select', '["Premium", "Standard", "Economy", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cooking Oils & Ghee
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-oils-ghee'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('oil_type', 'Oil/Ghee Type', 'select', '["Mustard Oil", "Vegetable Oil", "Sunflower Oil", "Coconut Oil", "Palm Oil", "Olive Oil", "Ghee (Clarified Butter)", "Other"]', true, 1),
  ('extraction_method', 'Extraction Method', 'select', '["Cold Pressed", "Refined", "Traditional", "Other"]', false, 2),
  ('volume', 'Volume (ml)', 'number', null, false, 3),
  ('smoke_point', 'Smoke Point Info', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Spices & Seasonings
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-spices-seasonings'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('spice_type', 'Spice Type', 'select', '["Turmeric", "Chili Powder", "Cumin", "Coriander", "Garam Masala", "Himalayan Salt", "Timur (Sichuan Pepper)", "Fenugreek", "Asafoetida", "Mixed Spice", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Whole", "Ground/Powder", "Seeds", "Mixed", "Other"]', false, 2),
  ('weight', 'Weight (g)', 'number', null, false, 3),
  ('freshness', 'Freshness Grade', 'select', '["Fresh/Recent", "Standard", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Pickles & Preserves
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-pickles-preserves'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('pickle_type', 'Pickle Type', 'select', '["Mango Pickle", "Lime Pickle", "Mixed Vegetable", "Gundruk", "Chili Pickle", "Tomato Pickle", "Other"]', true, 1),
  ('spice_level', 'Spice Level', 'select', '["Mild", "Medium", "Hot", "Very Hot"]', false, 2),
  ('jar_size', 'Jar Size (ml)', 'number', null, false, 3),
  ('homemade_artisan', 'Homemade/Artisan', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Sauces & Condiments
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-sauces-condiments'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('sauce_type', 'Sauce Type', 'select', '["Hot Sauce", "Soy Sauce", "Ketchup", "Mayonnaise", "Mustard", "Chutney", "Bhut Jolokia Sauce", "Other"]', true, 1),
  ('bottle_size', 'Bottle Size (ml)', 'number', null, false, 2),
  ('heat_level', 'Heat Level (if applicable)', 'select', '["Not Spicy", "Mild", "Medium", "Hot", "Very Hot"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Dry Fruits & Nuts
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-dry-fruits-nuts'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('dry_fruit_type', 'Type', 'select', '["Almonds", "Cashews", "Walnuts", "Raisins", "Dates", "Apricots", "Figs", "Mixed Dry Fruits", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Raw", "Roasted", "Salted", "Soaked", "Other"]', false, 2),
  ('weight', 'Weight (g)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Vegetables (Fresh Produce)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-vegetables'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('vegetable_type', 'Vegetable Type', 'select', '["Tomato", "Potato", "Onion", "Garlic", "Ginger", "Cauliflower", "Cabbage", "Spinach", "Cucumber", "Green Chilli", "Akabare Chilli", "Bell Pepper", "Carrot", "Radish", "Pumpkin", "Other"]', true, 1),
  ('variety', 'Variety', 'text', null, false, 2),
  ('freshness', 'Freshness', 'select', '["Very Fresh (Today)", "Fresh (1-2 days)", "Slightly aged", "Other"]', false, 3),
  ('price_per_unit', 'Price Per', 'select', '["Per kg", "Per 500g", "Per piece", "Per dozen", "Per bundle"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Fruits (Fresh Produce)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-fruits'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('fruit_type', 'Fruit Type', 'select', '["Apple", "Orange", "Banana", "Mango", "Papaya", "Pineapple", "Grapes", "Guava", "Lemon", "Pomegranate", "Watermelon", "Strawberry", "Kiwi", "Other"]', true, 1),
  ('variety', 'Variety', 'text', null, false, 2),
  ('ripeness', 'Ripeness', 'select', '["Ripe & Ready", "Half-ripe", "Green (for ripening)", "Other"]', false, 3),
  ('price_per_unit', 'Price Per', 'select', '["Per kg", "Per piece", "Per dozen", "Per crate"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Herbs & Greens (Fresh Produce)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-herbs-greens'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('herb_type', 'Type', 'select', '["Cilantro/Coriander leaves", "Mint", "Parsley", "Basil", "Green Lettuce", "Spinach Leaves", "Fenugreek Leaves", "Other"]', true, 1),
  ('freshness', 'Freshness', 'select', '["Very Fresh (Today)", "Fresh (1-2 days)", "Other"]', false, 2),
  ('bundle_size', 'Bundle Size (g)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Meat (Poultry & Other)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-meat-poultry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('meat_type', 'Meat Type', 'select', '["Chicken", "Goat/Mutton", "Buff/Buffalo", "Pork", "Lamb", "Duck", "Other"]', true, 1),
  ('cut_type', 'Cut Type', 'select', '["Whole Bird/Carcass", "Breast", "Thigh", "Wings", "Legs", "Ground/Mince", "Mixed Cuts", "Other"]', false, 2),
  ('fresh_frozen', 'Fresh or Frozen', 'select', '["Fresh", "Frozen", "Chilled"]', true, 3),
  ('bone_in', 'Bone-in or Boneless', 'select', '["Bone-in", "Boneless", "Mixed"]', false, 4),
  ('weight', 'Weight (kg)', 'number', null, false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Fish & Seafood
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-fish-seafood'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('fish_type', 'Fish/Seafood Type', 'select', '["Carp", "Tilapia", "Catfish", "Shrimp/Prawns", "Crabs", "Squid", "Salmon", "Tuna", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Whole Fish", "Fillet", "Steak", "Headless", "Other"]', false, 2),
  ('fresh_frozen', 'Fresh or Frozen', 'select', '["Fresh", "Frozen", "Chilled"]', true, 3),
  ('weight', 'Weight (kg)', 'number', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Processed Meat
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-processed-meat'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Bacon", "Sausages", "Ham", "Salami", "Pepperoni", "Dried Meat", "Other"]', true, 1),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

-- Milk & Milk Products
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-milk-products'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Fresh Milk", "Powdered Milk", "Condensed Milk", "Evaporated Milk", "Other"]', true, 1),
  ('volume_ml', 'Volume (ml)', 'number', null, false, 2),
  ('fat_content', 'Fat Content (if known)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cheese & Paneer
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-cheese-paneer'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('cheese_type', 'Type', 'select', '["Paneer", "Cheddar", "Mozzarella", "Feta", "Local Cheese", "Other"]', true, 1),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 2),
  ('fresh_packed', 'Fresh/Packed Status', 'select', '["Fresh (Today)", "Packed"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Ghee & Butter
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-ghee-butter'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Ghee (Clarified Butter)", "Butter", "Cow Ghee", "Buffalo Ghee", "Local Ghee", "Other"]', true, 1),
  ('jar_size_ml', 'Jar Size (ml)', 'number', null, false, 2),
  ('purity', 'Purity', 'select', '["Pure", "100% Natural", "Standard", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Eggs
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-eggs'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('egg_type', 'Egg Type', 'select', '["Chicken Eggs", "Duck Eggs", "Quail Eggs", "Other"]', true, 1),
  ('quantity', 'Quantity (pieces)', 'select', '["6", "12", "18", "30", "Other"]', false, 2),
  ('grade', 'Grade/Size', 'select', '["Small", "Medium", "Large", "Extra Large"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Yogurt & Dahi
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-yogurt-dahi'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('yogurt_type', 'Type', 'select', '["Plain Dahi", "Flavored Yogurt", "Greek Yogurt", "Sweetened Dahi", "Other"]', true, 1),
  ('container_size', 'Container Size (ml)', 'number', null, false, 2),
  ('quantity', 'Quantity (containers)', 'select', '["1", "4", "6", "12"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Bread & Rolls
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-bread-rolls'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('bread_type', 'Bread Type', 'select', '["Whole Wheat", "White Bread", "Multigrain", "Sourdough", "Naan", "Roti", "Other"]', true, 1),
  ('form', 'Form', 'select', '["Loaf", "Rolls/Buns", "Individual Pieces", "Other"]', false, 2),
  ('freshness', 'Freshness', 'select', '["Fresh (Today)", "Fresh (Yesterday)", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cakes & Pastries
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-cakes-pastries'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('cake_type', 'Type', 'select', '["Vanilla Cake", "Chocolate Cake", "Fruit Cake", "Pastry", "Donut", "Croissant", "Other"]', true, 1),
  ('size', 'Size/Quantity', 'select', '["Individual", "Small (2-4 servings)", "Medium (4-6 servings)", "Large (8+ servings)", "Bulk"]', false, 2),
  ('customization', 'Customizable/Special Order', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cookies & Biscuits
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-cookies-biscuits'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('cookie_type', 'Type', 'select', '["Chocolate Chip", "Oatmeal", "Digestive Biscuits", "Cream Biscuits", "Shortbread", "Other"]', true, 1),
  ('pack_size', 'Pack Size', 'number', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

-- Chips & Crisps
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-chips-crisps'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('chip_type', 'Type', 'select', '["Potato Chips", "Corn Chips", "Vegetable Chips", "Prawn Chips", "Other"]', true, 1),
  ('flavor', 'Flavor', 'text', null, false, 2),
  ('pack_size', 'Pack Size (g)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Savory Snacks (Namkeen)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-savory-snacks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('snack_type', 'Snack Type', 'select', '["Namkeen Mix", "Chivda", "Chakli", "Bhel", "Chikhalwali", "Sev", "Other"]', true, 1),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 2),
  ('spice_level', 'Spice Level', 'select', '["Mild", "Medium", "Hot"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Roasted Nuts & Namkeen
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-roasted-nuts'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('nut_type', 'Nut Type', 'select', '["Roasted Chickpeas", "Roasted Peanuts", "Mixed Nuts", "Roasted Seeds", "Other"]', true, 1),
  ('salt_level', 'Salt Level', 'select', '["Unsalted", "Lightly Salted", "Salted", "Other"]', false, 2),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Mithai & Indian Sweets
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-mithai'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('sweet_type', 'Sweet Type', 'select', '["Laddu", "Barfi", "Jalebi", "Peda", "Kheer", "Gulab Jamun", "Rasgulla", "Kaju Katli", "Other"]', true, 1),
  ('quantity', 'Quantity', 'text', null, false, 2),
  ('occasion', 'Occasion', 'select', '["Festival", "Wedding", "Gift", "Daily", "Other"]', false, 3),
  ('dietary_info', 'Dietary Info', 'select', '["Pure Veg", "Pure Ghee", "Dairy-free", "Sugar-free", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Chocolates & Confectionery
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-chocolates'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('chocolate_type', 'Type', 'select', '["Dark Chocolate", "Milk Chocolate", "White Chocolate", "Chocolate Truffles", "Chocolate Bars", "Confectionery Mix", "Other"]', true, 1),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 2),
  ('cocoa_percentage', 'Cocoa Percentage (if known)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Ice Cream & Frozen Desserts
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-ice-cream'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('ice_cream_type', 'Type', 'select', '["Vanilla", "Chocolate", "Strawberry", "Kulfi", "Popsicle", "Sundae", "Other"]', true, 1),
  ('container_size', 'Container Size (ml or quantity)', 'text', null, false, 2),
  ('vegan_dairy_free', 'Vegan/Dairy-free', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Tea & Coffee
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-tea-coffee'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('beverage_type', 'Type', 'select', '["Black Tea", "Green Tea", "Herbal Tea", "White Tea", "Oolong Tea", "Ground Coffee", "Coffee Beans", "Instant Coffee", "Pashmina Tea"]', true, 1),
  ('origin', 'Origin/Region', 'text', null, false, 2),
  ('pack_weight', 'Pack Weight (g)', 'number', null, false, 3),
  ('brewing_style', 'Brewing Style (if applicable)', 'select', '["Loose Leaf", "Tea Bags", "Ground", "Instant"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Juices & Drinks
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-juices-drinks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('juice_type', 'Type', 'select', '["Orange Juice", "Apple Juice", "Mango Juice", "Mixed Fruit Juice", "Sugarcane Juice", "Vegetable Juice", "Other"]', true, 1),
  ('bottle_size', 'Bottle Size (ml)', 'number', null, false, 2),
  ('sugar_content', 'Sugar Content (if known)', 'select', '["No Added Sugar", "Low Sugar", "Standard", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Soft Drinks & Sodas
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-soft-drinks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('drink_type', 'Drink Type', 'select', '["Cola", "Lemonade", "Ginger Ale", "Juice Drink", "Energy Drink", "Sports Drink", "Other"]', true, 1),
  ('bottle_size', 'Bottle Size (ml)', 'number', null, false, 2),
  ('pack_quantity', 'Pack Quantity (if multi-pack)', 'select', '["Single", "6-pack", "12-pack", "24-pack", "Bulk"]', false, 3),
  ('carbonated', 'Carbonated', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Water & Sports Drinks
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-water-sports-drinks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('water_type', 'Type', 'select', '["Mineral Water", "Spring Water", "Purified Water", "Sports Drink", "Energy Drink", "Coconut Water", "Other"]', true, 1),
  ('bottle_size', 'Bottle Size (ml or L)', 'text', null, false, 2),
  ('pack_quantity', 'Pack Quantity (if multi-pack)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Alcoholic Beverages
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-alcoholic-beverages'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('beverage_type', 'Type', 'select', '["Beer", "Wine", "Spirits/Hard Liquor", "Local Brew", "Other"]', true, 1),
  ('bottle_size', 'Bottle Size (ml)', 'number', null, false, 2),
  ('alcohol_percentage', 'Alcohol % (ABV)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Homemade Food Preparations
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-homemade-prep'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('food_type', 'Food Type', 'select', '["Cooked Meal", "Snacks", "Baked Goods", "Pickles/Preserves", "Sweets", "Other"]', true, 1),
  ('made_today', 'Made Today', 'boolean', null, false, 2),
  ('pack_quantity', 'Quantity/Servings', 'text', null, false, 3),
  ('contains_allergens', 'Contains Allergens (describe)', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Artisan Food Products
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-artisan-products'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Artisan Bread", "Artisan Cheese", "Handmade Pasta", "Specialty Sauce", "Specialty Oil", "Other"]', true, 1),
  ('production_method', 'Production Method', 'text', null, false, 2),
  ('quantity', 'Quantity Available', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Ready-to-Eat Meals
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-ready-to-eat'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('meal_type', 'Meal Type', 'select', '["Biryani", "Curry", "Noodles", "Pizza", "Sandwich", "Momo", "Chow Mein", "Other"]', true, 1),
  ('servings', 'Number of Servings', 'number', null, false, 2),
  ('dietary_info', 'Dietary Info', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Food Gifts & Hampers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-gift-hampers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('hamper_type', 'Hamper Type', 'select', '["Gourmet Basket", "Chocolate/Sweets Basket", "Tea/Coffee Gift", "Dry Fruits Basket", "Mixed Assortment", "Custom Hamper", "Other"]', true, 1),
  ('items_count', 'Number of Items', 'number', null, false, 2),
  ('occasion', 'Occasion', 'select', '["Festival", "Wedding", "Corporate Gift", "Birthday", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Traditional Nepali Foods
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-traditional-nepali'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('food_type', 'Food Type', 'select', '["Gundruk", "Sinki", "Chhurpi", "Dhido Flour", "Sel Roti", "Momo", "Momos Filling", "Sekuwa", "Thakali Specialty", "Other"]', true, 1),
  ('homemade_artisan', 'Homemade/Artisan', 'boolean', null, false, 2),
  ('origin_region', 'Origin Region (if applicable)', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Local Crops & Produce
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-local-crops'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('crop_type', 'Crop Type', 'select', '["Local Rice Variety", "Local Millet", "Local Beans", "Himalayan Vegetables", "Mountain Herbs", "Other"]', true, 1),
  ('farm_origin', 'Farm/Village Origin', 'text', null, false, 2),
  ('season', 'Season', 'select', '["Spring", "Summer", "Monsoon", "Autumn", "Winter", "Year-round"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Organic & Farmers Market
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-organic-farmers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Product Type', 'select', '["Organic Vegetables", "Organic Fruits", "Organic Grains", "Organic Spices", "Farm Fresh Produce", "Other"]', true, 1),
  ('certification', 'Certification', 'select', '["Certified Organic", "Non-certified but Organic", "Natural/No Pesticides"]', false, 2),
  ('farmer_name', 'Farmer/Producer Name', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Regional Specialty Foods
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-regional-specialty'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('specialty_type', 'Specialty Type', 'select', '["Darjeeling Tea", "Ilam Coffee", "Mustang Momo", "Bhaktapur Pottery", "Himalayan Honey", "Chitwan Spices", "Other"]', true, 1),
  ('origin_region', 'Region of Origin', 'text', null, false, 2),
  ('traditional', 'Traditional Recipe/Method', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- PHASE 5: INDEXES FOR PERFORMANCE
-- ---------------------------------------------------------------------------

-- No schema changes needed; existing indexes on category_id, key already in place
