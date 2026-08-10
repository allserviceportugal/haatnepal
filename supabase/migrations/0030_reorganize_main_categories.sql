-- haatnepal: Reorganize categories back to original main structure
-- Moves newer top-level categories (Books, Movies, Events, Government Notices)
-- under appropriate existing main categories to keep original structure

-- =========================================================================
-- Move Books & Learning under Hobbies & Sports
-- =========================================================================
update public.categories
set parent_id = (select id from public.categories where slug = 'hobbies-sports' limit 1)
where slug = 'books-learning';

-- =========================================================================
-- Move Movies, Cinema & Theatre under Hobbies & Sports
-- =========================================================================
update public.categories
set parent_id = (select id from public.categories where slug = 'hobbies-sports' limit 1)
where slug = 'movies-cinema-theatre';

-- =========================================================================
-- Move Events & Happenings under Services
-- =========================================================================
update public.categories
set parent_id = (select id from public.categories where slug = 'services' limit 1)
where slug = 'events-happenings';

-- =========================================================================
-- Move Government Notices & Tenders under Business & Industrial
-- =========================================================================
update public.categories
set parent_id = (select id from public.categories where slug = 'business-industrial' limit 1)
where slug = 'government-notices-tenders';

-- =========================================================================
-- Resulting Structure (back to original 15 top-level main categories)
-- =========================================================================
-- 1. Vehicles
-- 2. Real Estate
-- 3. Electronics
-- 4. Home & Living
-- 5. Fashion
-- 6. Jobs
-- 7. Services
--    └─ Events & Happenings (moved from top-level)
-- 8. Hobbies & Sports
--    ├─ Books & Learning (moved from top-level)
--    └─ Movies, Cinema & Theatre (moved from top-level)
-- 9. Pets
-- 10. Agriculture
-- 11. Health & Beauty
-- 12. Business & Industrial
--     └─ Government Notices & Tenders (moved from top-level)
-- 13. Antiques & Collectibles
-- 14. Free Stuff
-- 15. Food & Beverages
