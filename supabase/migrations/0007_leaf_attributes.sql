-- haatnepal: leaf-specific category_attributes (override the inherited
-- top-level set for the highest-traffic leaves) + two new department-wide
-- fallback sets for departments that had none.

-- Electronics leaves
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'smartphones'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Samsung", "Apple", "Xiaomi", "OPPO", "Vivo", "Realme", "OnePlus", "Other"]', true, 1),
  ('storage', 'Storage', 'select', '["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]', false, 2),
  ('ram', 'RAM', 'select', '["2GB", "3GB", "4GB", "6GB", "8GB", "12GB", "16GB"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'laptops'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "MSI", "Other"]', true, 1),
  ('ram', 'RAM', 'select', '["4GB", "8GB", "16GB", "32GB", "64GB"]', false, 2),
  ('storage', 'Storage', 'select', '["128GB SSD", "256GB SSD", "512GB SSD", "1TB SSD", "1TB HDD", "2TB HDD"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'desktop-computers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('processor_series', 'Series', 'select', '["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Other"]', true, 1),
  ('ram', 'RAM size', 'select', '["4GB", "8GB", "16GB", "32GB", "64GB"]', false, 2),
  ('storage', 'Storage', 'select', '["256GB SSD", "512GB SSD", "1TB SSD", "1TB HDD", "2TB HDD"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'televisions'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Samsung", "LG", "Sony", "TCL", "Xiaomi", "Other"]', true, 1),
  ('screen_size', 'Screen Size', 'select', '["32\"", "40\"", "43\"", "50\"", "55\"", "65\"", "75\"+"]', false, 2),
  ('resolution', 'Resolution', 'select', '["HD", "Full HD", "4K UHD", "8K"]', false, 3),
  ('smart_tv', 'Smart TV', 'boolean', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Real Estate leaves
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'apartments-for-sale'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('rooms', 'Rooms', 'select', '["1", "2", "3", "4", "5+"]', false, 1),
  ('furnished', 'Furnished', 'boolean', null, false, 2),
  ('floor', 'Floor', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'apartments-for-rent'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('rooms', 'Rooms', 'select', '["1", "2", "3", "4", "5+"]', false, 1),
  ('furnished', 'Furnished', 'boolean', null, false, 2),
  ('floor', 'Floor', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'houses-for-sale'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('rooms', 'Rooms', 'select', '["1", "2", "3", "4", "5+"]', false, 1),
  ('furnished', 'Furnished', 'boolean', null, false, 2),
  ('area_sqft', 'Area (sq ft)', 'number', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Fashion leaves
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('size', 'Size', 'select', '["XS", "S", "M", "L", "XL", "XXL"]', false, 1),
  ('brand', 'Brand', 'select', '["Nike", "Adidas", "Zara", "H&M", "Local Brand", "Other"]', false, 2),
  ('color', 'Color', 'select', '["Black", "White", "Blue", "Red", "Green", "Grey", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('womens-clothing', 'mens-clothing', 'kids-clothing');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, t.key, t.label, t.input_type::public.attribute_input_type, t.options::jsonb, t.is_required, t.sort_order
from public.categories c
cross join (values
  ('size', 'Shoe Size (EU)', 'select', '["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]', false, 1),
  ('brand', 'Brand', 'select', '["Nike", "Adidas", "Puma", "Local Brand", "Other"]', false, 2),
  ('color', 'Color', 'select', '["Black", "White", "Blue", "Red", "Grey", "Other"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order)
where c.slug in ('womens-shoes', 'mens-shoes');

-- Department-wide fallbacks for departments with no attributes yet
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'home-living'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('material', 'Material', 'select', '["Wood", "Metal", "Plastic", "Glass", "Fabric", "Other"]', false, 1),
  ('dimensions', 'Dimensions', 'text', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'hobbies-sports'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Nike", "Adidas", "Decathlon", "Local Brand", "Other"]', false, 1)
) as t(key, label, input_type, options, is_required, sort_order);
