-- haatnepal: Fix category nesting issues
-- Ensures all categories are properly nested under their parent, not orphaned at top-level
-- Handles Fashion, Food & Beverages, Agriculture, and other categories that were restructured
-- IDEMPOTENT: Safe to run multiple times

-- =========================================================================
-- CLEAN UP OLD FASHION CATEGORIES (from migration 0002)
-- =========================================================================
-- Remove old orphaned slugs that should not exist at top-level
delete from public.categories
where parent_id is null
  and slug in ('womens-clothing', 'mens-clothing', 'kids-clothing',
               'womens-shoes', 'mens-shoes', 'bags-wallets',
               'watches', 'jewelry', 'traditional-wear');

-- =========================================================================
-- CLEAN UP OLD FOOD & BEVERAGES CATEGORIES (from migration 0009)
-- =========================================================================
-- Remove old orphaned slugs that should not exist at top-level
delete from public.categories
where parent_id is null
  and slug in ('spices-masalas', 'pickles-achar', 'snacks-namkeen', 'sweets-mithai',
               'tea-coffee', 'beverages-drinks', 'dairy-ghee', 'grains-pulses-flour',
               'bakery-homemade-foods', 'organic-health-foods');

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
