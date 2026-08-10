-- haatnepal: FINAL CLEANUP - Nest all orphaned categories under their proper parents
-- This migration fixes ALL orphaned categories that are incorrectly at top-level
-- Ensures proper hierarchy: Fashion has all fashion-* categories as children

-- =========================================================================
-- MOVE ALL FASHION-RELATED CATEGORIES UNDER FASHION PARENT
-- =========================================================================

-- Get Fashion ID for reference
WITH fashion_id AS (
  SELECT id FROM public.categories WHERE slug = 'fashion' LIMIT 1
)

UPDATE public.categories
SET parent_id = (SELECT id FROM fashion_id)
WHERE slug IN (
  -- Main Fashion departments
  'fashion-women', 'fashion-men', 'fashion-kids', 'fashion-ethnic',
  'fashion-watches', 'fashion-jewelry', 'fashion-bags', 'fashion-accessories',
  -- Individual items that got created at top level
  'women-fashion', 'mens-fashion', 'kids-fashion',
  'watches', 'jewelry', 'bags-luggage', 'accessories',
  -- Specific items that shouldn't be at top level
  'dresses', 'handbags', 'lingerie',
  'gold-jewelry', 'silver-jewelry', 'gemstones-precious-stones',
  'watch-accessories-repair', 'wedding-bridal-jewelry',
  'traditional-nepali-ornaments'
)
AND parent_id IS NULL;

-- =========================================================================
-- VERIFY STRUCTURE: Should result in exactly 15 top-level categories
-- =========================================================================
-- Expected top-level after this migration:
-- 1. Vehicles
-- 2. Real Estate
-- 3. Electronics
-- 4. Home & Living
-- 5. Fashion (now with all fashion items as children)
-- 6. Jobs
-- 7. Services
-- 8. Hobbies & Sports
-- 9. Pets
-- 10. Agriculture
-- 11. Health & Beauty
-- 12. Business & Industrial
-- 13. Antiques & Collectibles
-- 14. Free Stuff
-- 15. Food & Beverages
