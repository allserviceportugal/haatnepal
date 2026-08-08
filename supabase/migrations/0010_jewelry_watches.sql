-- haatnepal: proper Jewelry & Watches group under Fashion. Previously
-- "Women's Jewelry" and "Men's Watches" existed only as scattered leaves
-- under Fashion > Women / Fashion > Men — no dedicated ornaments category,
-- despite jewelry (gold/silver/traditional) being a major vertical in the
-- Nepal market. Mirrors Allegro's real "Biżuteria i zegarki" department,
-- nested here as a sibling group to Women/Men/Kids (matching how this
-- taxonomy already treats Fashion's other mid-tier groups).

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion'), 'Jewelry & Watches', 'fashion-jewelry-watches';

-- Move the two existing leaves into the new group.
update public.categories
set parent_id = (select id from public.categories where slug = 'fashion-jewelry-watches')
where slug in ('womens-jewelry', 'mens-watches');

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-jewelry-watches'), name, slug
from (values
  ('Gold Jewelry', 'gold-jewelry'),
  ('Silver Jewelry', 'silver-jewelry'),
  ('Traditional Nepali Ornaments', 'traditional-nepali-ornaments'),
  ('Gemstones & Precious Stones', 'gemstones-precious-stones'),
  ('Wedding & Bridal Jewelry', 'wedding-bridal-jewelry'),
  ('Fashion & Imitation Jewelry', 'fashion-imitation-jewelry'),
  ('Men''s Jewelry', 'mens-jewelry'),
  ('Women''s Watches', 'womens-watches'),
  ('Watch Accessories & Repair', 'watch-accessories-repair')
) as t(name, slug);

-- Group-level fallback attributes, inherited by every leaf in this group via
-- the existing nearest-ancestor-with-attributes lookup.
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'fashion-jewelry-watches'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('material', 'Material', 'select', '["Gold", "Silver", "Platinum", "Gemstone", "Imitation/Alloy", "Other"]', false, 1),
  ('purity_karat', 'Purity / Karat', 'text', null, false, 2),
  ('weight_grams', 'Weight (grams)', 'text', null, false, 3),
  ('occasion', 'Occasion', 'select', '["Daily wear", "Wedding", "Festival", "Gift", "Other"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);
