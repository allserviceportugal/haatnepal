-- haatnepal: "Business Cooperation & Investment" — for people seeking
-- business partners, investors, or offering to invest/joint-venture.
-- Distinct from "Businesses for Sale" (0011): that's an outright sale,
-- this is about ongoing partnership/capital arrangements.

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'business-industrial'), 'Business Cooperation & Investment', 'business-cooperation-investment';

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'business-cooperation-investment'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('cooperation_type', 'Looking for', 'select', '["Investor", "Business partner", "Joint venture", "Offering investment", "Other"]', true, 1),
  ('industry', 'Industry', 'text', null, false, 2),
  ('investment_amount', 'Investment amount (approx.)', 'text', null, false, 3),
  ('equity_offered', 'Equity offered', 'text', null, false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
