-- haatnepal: new top-level department, Food & Beverages — covers homemade
-- and packaged food sales (spices, achar, mithai, etc.), which the taxonomy
-- had no category for at all.

insert into public.categories (name, slug, icon) values
  ('Food & Beverages', 'food-beverages', 'utensils');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'food-beverages'), name, slug
from (values
  ('Spices & Masalas', 'spices-masalas'),
  ('Pickles & Achar', 'pickles-achar'),
  ('Snacks & Namkeen', 'snacks-namkeen'),
  ('Sweets & Mithai', 'sweets-mithai'),
  ('Tea & Coffee', 'tea-coffee'),
  ('Beverages & Drinks', 'beverages-drinks'),
  ('Dairy & Ghee', 'dairy-ghee'),
  ('Grains, Pulses & Flour', 'grains-pulses-flour'),
  ('Bakery & Homemade Foods', 'bakery-homemade-foods'),
  ('Organic & Health Foods', 'organic-health-foods')
) as t(name, slug);

-- Department-wide fallback attributes (inherited by every leaf above via the
-- existing nearest-ancestor-with-attributes lookup, same as Home & Living /
-- Hobbies & Sports in 0007).
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'food-beverages'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('unit', 'Unit', 'select', '["Gram", "Kilogram", "Litre", "Piece", "Packet", "Dozen"]', false, 1),
  ('homemade', 'Homemade', 'boolean', null, false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3),
  ('expiry_date', 'Best before', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
