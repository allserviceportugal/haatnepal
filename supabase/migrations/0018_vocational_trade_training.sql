-- haatnepal: "Vocational & Trade Training" under Tutoring & Classes —
-- hands-on trade skills (barista, chef, electrician, plumbing, etc.) that
-- didn't fit "Professional & Skill Development" (office/business skills).

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'tutoring-classes'), 'Vocational & Trade Training', 'vocational-trade-training';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'vocational-trade-training'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('trade_type', 'Trade', 'select', '["Electrician", "Plumbing", "Barista/Baking", "Chef/Culinary Arts", "Beautician/Cosmetology", "Tailoring/Fashion Design", "Mechanic/Automobile", "Carpentry/Welding", "Other"]', true, 1),
  ('mode', 'Mode', 'select', '["In-person", "Online", "Both"]', false, 2),
  ('certification_provided', 'Certificate provided', 'boolean', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);
