-- haatnepal: flesh out the categories added in 0009-0013 with proper leaf
-- attributes/filters, and split "Businesses for Sale" / "Tours &
-- Activities" into real subcategory groups (they're broad enough verticals
-- to deserve it, same treatment as Jewelry & Watches in 0010).

-- ---------------------------------------------------------------------------
-- Food & Beverages leaves
-- ---------------------------------------------------------------------------
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'spices-masalas'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('spice_type', 'Type', 'select', '["Turmeric", "Cumin", "Chili powder", "Garam Masala", "Coriander", "Mixed spice blend", "Other"]', true, 1),
  ('packaging', 'Packaging', 'select', '["Loose", "Packet", "Jar"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'pickles-achar'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('achar_type', 'Type', 'select', '["Mango", "Lime", "Mixed vegetable", "Gundruk", "Chili", "Sesame/Til", "Other"]', true, 1),
  ('spice_level', 'Spice level', 'select', '["Mild", "Medium", "Hot"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'snacks-namkeen'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('snack_type', 'Type', 'select', '["Chips/Crisps", "Namkeen mix", "Roasted nuts", "Chatpate", "Sel roti", "Popcorn", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'sweets-mithai'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('mithai_type', 'Type', 'select', '["Laddu", "Barfi", "Jeri/Jalebi", "Peda", "Mixed assortment", "Other"]', true, 1),
  ('occasion', 'Occasion', 'select', '["Festival", "Wedding", "Daily", "Gift"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'tea-coffee'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('beverage_type', 'Type', 'select', '["Black tea", "Green tea", "Herbal tea", "Ground coffee", "Coffee beans", "Instant coffee"]', true, 1),
  ('origin', 'Origin', 'text', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'beverages-drinks'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('drink_type', 'Type', 'select', '["Juice", "Soft drink", "Water", "Energy drink", "Alcoholic", "Other"]', true, 1),
  ('is_alcoholic', 'Alcoholic', 'boolean', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'dairy-ghee'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('dairy_type', 'Type', 'select', '["Ghee", "Butter", "Cheese", "Yogurt/Dahi", "Milk", "Paneer", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'grains-pulses-flour'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('grain_type', 'Type', 'select', '["Rice", "Wheat flour", "Lentils/Dal", "Maize", "Millet", "Other"]', true, 1),
  ('pack_size', 'Pack size', 'text', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'bakery-homemade-foods'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('bakery_type', 'Type', 'select', '["Bread", "Cake", "Cookies", "Homemade meal", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'organic-health-foods'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('product_type', 'Type', 'select', '["Organic vegetables", "Superfoods", "Health supplements", "Gluten-free", "Other"]', true, 1),
  ('certification', 'Certification', 'text', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Jewelry & Watches leaves
-- ---------------------------------------------------------------------------
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'gold-jewelry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('item_type', 'Item type', 'select', '["Necklace/Set", "Earrings", "Ring", "Bangle/Bracelet", "Chain", "Anklet", "Other"]', true, 1),
  ('karat', 'Karat', 'select', '["18K", "22K", "24K", "Other"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'silver-jewelry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('item_type', 'Item type', 'select', '["Necklace/Set", "Earrings", "Ring", "Bangle/Bracelet", "Chain", "Anklet", "Other"]', true, 1),
  ('purity', 'Purity', 'select', '["925 Sterling", "999 Fine", "Other"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'traditional-nepali-ornaments'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('ornament_type', 'Ornament type', 'select', '["Tilhari", "Sun (Nose ring)", "Paute", "Mangalsutra", "Sirbandi", "Dhungri", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'gemstones-precious-stones'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('stone_type', 'Stone type', 'select', '["Ruby", "Emerald", "Sapphire", "Diamond", "Pearl", "Coral", "Other"]', true, 1),
  ('certified', 'Certified', 'boolean', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'wedding-bridal-jewelry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('set_type', 'Set type', 'select', '["Full bridal set", "Necklace set", "Tiara/Mukut", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'fashion-imitation-jewelry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('item_type', 'Item type', 'select', '["Necklace", "Earrings", "Ring", "Bracelet", "Set", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'mens-jewelry'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('item_type', 'Item type', 'select', '["Chain", "Ring", "Bracelet", "Kada", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('brand', 'Brand', 'select', '["Casio", "Titan", "Fossil", "Fastrack", "Rolex", "Other"]', false, 1),
  ('movement', 'Movement', 'select', '["Quartz", "Automatic", "Digital"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('mens-watches', 'womens-watches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'watch-accessories-repair'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('service_type', 'Type', 'select', '["Battery replacement", "Strap replacement", "Repair service", "Watch box/case", "Other"]', true, 1)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Businesses for Sale: split into subcategories by business type. Drop the
-- old free-text business_type attribute (now redundant with the
-- subcategory); keep the rest as a group-level fallback for every leaf.
-- ---------------------------------------------------------------------------
delete from public.category_attributes
where category_id = (select id from public.categories where slug = 'businesses-for-sale')
  and key = 'business_type';

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'businesses-for-sale'), name, slug
from (values
  ('Restaurant & Cafe', 'restaurant-cafe-for-sale'),
  ('Retail Shop & Store', 'retail-shop-for-sale'),
  ('Manufacturing Unit', 'manufacturing-unit-for-sale'),
  ('Franchise', 'franchise-for-sale'),
  ('Online Business', 'online-business-for-sale'),
  ('Hotel & Lodge', 'hotel-lodge-for-sale'),
  ('Service Business', 'service-business-for-sale'),
  ('Wholesale & Distribution', 'wholesale-distribution-for-sale')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Tours & Activities: split into subcategories by activity type. Drop the
-- old activity_type select (redundant with subcategory); keep
-- duration/group_size/difficulty as a group-level fallback.
-- ---------------------------------------------------------------------------
delete from public.category_attributes
where category_id = (select id from public.categories where slug = 'tours-activities')
  and key = 'activity_type';

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tours-activities'), name, slug
from (values
  ('Trekking Packages', 'trekking-packages'),
  ('City Tours & Sightseeing', 'city-tours-sightseeing'),
  ('Adventure Sports & Rafting', 'adventure-sports-rafting'),
  ('Wildlife & Jungle Safari', 'wildlife-jungle-safari'),
  ('Cultural & Heritage Tours', 'cultural-heritage-tours'),
  ('Pilgrimage Tours', 'pilgrimage-tours'),
  ('Guide & Porter Services', 'guide-porter-services')
) as t(name, slug);
