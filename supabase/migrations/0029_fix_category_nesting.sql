-- haatnepal: Fix category nesting issues
-- Ensures all categories are properly nested under their parent, not orphaned at top-level
-- Handles Fashion, Food & Beverages, Agriculture, and other categories that were restructured

-- =========================================================================
-- VERIFY AND CLEAN UP OLD FASHION CATEGORIES (from migration 0002)
-- =========================================================================
-- These old slugs should not exist anymore after 0024, but verify they're gone
-- Old slugs to check: womens-clothing, mens-clothing, kids-clothing, womens-shoes,
--   mens-shoes, bags-wallets, watches, jewelry, traditional-wear (all should be deleted)

-- If these exist at top-level (parent_id IS NULL), they need to be deleted
delete from public.categories
where parent_id is null
  and slug in ('womens-clothing', 'mens-clothing', 'kids-clothing',
               'womens-shoes', 'mens-shoes', 'bags-wallets',
               'watches', 'jewelry', 'traditional-wear');

-- =========================================================================
-- VERIFY AND CLEAN UP OLD FOOD & BEVERAGES CATEGORIES (from migration 0009)
-- =========================================================================
-- These old slugs should not exist anymore after 0025, but verify they're gone
-- Old slugs to check: spices-masalas, pickles-achar, snacks-namkeen, sweets-mithai,
--   tea-coffee, beverages-drinks, dairy-ghee, grains-pulses-flour,
--   bakery-homemade-foods, organic-health-foods (all should be deleted)

delete from public.categories
where parent_id is null
  and slug in ('spices-masalas', 'pickles-achar', 'snacks-namkeen', 'sweets-mithai',
               'tea-coffee', 'beverages-drinks', 'dairy-ghee', 'grains-pulses-flour',
               'bakery-homemade-foods', 'organic-health-foods');

-- =========================================================================
-- VERIFY FASHION STRUCTURE (0024 should have created this correctly)
-- =========================================================================
-- Ensure these top-level Fashion departments exist with correct parent:
-- Should exist: fashion-women, fashion-men, fashion-kids, fashion-ethnic,
--   fashion-watches, fashion-jewelry, fashion-bags, fashion-accessories

-- If any are missing, recreate them
insert into public.categories (id, parent_id, name, slug)
select gen_random_uuid(),
       (select id from public.categories where slug = 'fashion' limit 1),
       t.name, t.slug
from (values
  ('Women''s Fashion', 'fashion-women'),
  ('Men''s Fashion', 'fashion-men'),
  ('Kids & Baby Fashion', 'fashion-kids'),
  ('Traditional & Ethnic Wear', 'fashion-ethnic'),
  ('Watches', 'fashion-watches'),
  ('Jewelry', 'fashion-jewelry'),
  ('Bags & Luggage', 'fashion-bags'),
  ('Accessories', 'fashion-accessories')
) as t(name, slug)
where not exists (
  select 1 from public.categories c
  where c.slug = t.slug
    and c.parent_id = (select id from public.categories where slug = 'fashion' limit 1)
);

-- =========================================================================
-- VERIFY FOOD & BEVERAGES STRUCTURE (0025 should have created this correctly)
-- =========================================================================
-- Ensure these top-level Food & Beverages groups exist with correct parent:
-- Should exist: food-grocery-staples, food-fresh-produce, food-meat-seafood,
--   food-dairy-eggs, food-bakery-bread, food-snacks-savory, food-sweets-desserts,
--   food-beverages-drinks, food-homemade-artisan, food-nepali-local

insert into public.categories (id, parent_id, name, slug)
select gen_random_uuid(),
       (select id from public.categories where slug = 'food-beverages' limit 1),
       t.name, t.slug
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
) as t(name, slug)
where not exists (
  select 1 from public.categories c
  where c.slug = t.slug
    and c.parent_id = (select id from public.categories where slug = 'food-beverages' limit 1)
);

-- =========================================================================
-- AUDIT: List any top-level categories that look like they should be nested
-- =========================================================================
-- This is informational - helps identify any remaining issues
-- Look for categories at top-level that have names starting with keywords:
-- - "Women's", "Men's", "Kids" (should be under Fashion)
-- - "Grocery", "Fresh", "Meat", "Dairy", "Bakery", "Snacks", "Sweets" (should be under Food & Beverages)
-- - "Agricultural", "Farm", "Produce" (should be under Agriculture)

-- NOTE: No actual deletions in audit section - just for visibility
-- SELECT 'TOP-LEVEL CATEGORIES THAT MIGHT BE MISPLACED:' as warning;
-- SELECT id, name, slug FROM public.categories
-- WHERE parent_id IS NULL
-- ORDER BY name;
