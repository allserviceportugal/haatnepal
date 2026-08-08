-- haatnepal: "Businesses for Sale" — for sellers listing an entire running
-- business/franchise, not just equipment. Distinct from the existing
-- Business & Industrial leaves (which are all about buying gear), and had
-- no category at all before this.

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'business-industrial'), 'Businesses for Sale', 'businesses-for-sale';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'businesses-for-sale'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('business_type', 'Business type', 'text', null, true, 1),
  ('established_year', 'Established year', 'number', null, false, 2),
  ('monthly_revenue', 'Monthly revenue (approx.)', 'text', null, false, 3),
  ('employees', 'Number of employees', 'number', null, false, 4),
  ('includes_inventory', 'Includes inventory/equipment', 'boolean', null, false, 5),
  ('reason_for_selling', 'Reason for selling', 'text', null, false, 6)
) as t(key, label, input_type, options, is_required, sort_order);
