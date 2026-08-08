-- haatnepal: Agriculture had no category for irrigation gear or for farmers
-- selling actual produce (only Livestock, Feed, Seeds, Equipment, Dairy).

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'agriculture'), name, slug
from (values
  ('Irrigation Equipment & Accessories', 'irrigation-equipment-accessories'),
  ('Agricultural Produce & Grains', 'agricultural-produce-grains'),
  ('Fruits & Vegetables', 'fruits-vegetables')
) as t(name, slug);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'irrigation-equipment-accessories'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('equipment_type', 'Equipment type', 'select', '["Water pump", "Sprinkler system", "Drip irrigation kit", "Pipes & fittings", "Water tank", "Other"]', true, 1),
  ('power_source', 'Power source', 'select', '["Electric", "Diesel", "Solar", "Manual"]', false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'agricultural-produce-grains'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('produce_type', 'Type', 'select', '["Grains", "Pulses", "Cash crops", "Spices (raw)", "Other"]', true, 1),
  ('quantity_unit', 'Sold by', 'select', '["KG", "Quintal", "Ton", "Sack"]', false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'fruits-vegetables'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('produce_type', 'Type', 'select', '["Fruits", "Vegetables", "Mixed"]', true, 1),
  ('variety', 'Variety', 'text', null, false, 2),
  ('organic', 'Organic', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);
