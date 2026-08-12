-- Add missing subcategories to complete marketplace coverage
-- Focuses on Services (Telecom & Utilities), Home & Living, Pets, Health & Beauty expansions

-- =========================================================================
-- 1. SERVICES EXPANSION - Add Telecom & Utilities and other service types
-- =========================================================================

WITH services_id AS (
  SELECT id FROM categories WHERE slug = 'services' LIMIT 1
)
INSERT INTO categories (name, slug, parent_id)
SELECT * FROM (
  -- Telecom & Utilities Services
  VALUES
    ('Telecom & Utilities', 'telecom-utilities', (SELECT id FROM services_id)),
    ('Internet & Broadband', 'internet-broadband', (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)),
    ('Mobile Services', 'mobile-services', (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)),
    ('TV & Streaming', 'tv-streaming', (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)),
    ('Electricity & Gas', 'electricity-gas', (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)),
    ('Water & Plumbing', 'water-plumbing', (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)),

    -- Professional Services
    ('Professional Services', 'professional-services', (SELECT id FROM services_id)),
    ('Legal Services', 'legal-services', (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1)),
    ('Consulting', 'consulting', (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1)),
    ('Accounting & Tax', 'accounting-tax', (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1)),

    -- Home Services
    ('Home Services', 'home-services', (SELECT id FROM services_id)),
    ('Cleaning Services', 'cleaning-services', (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)),
    ('Repair & Maintenance', 'repair-maintenance', (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)),
    ('Plumbing & HVAC', 'plumbing-hvac', (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)),
    ('Electrical Services', 'electrical-services', (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)),
    ('Painting & Decor', 'painting-decor', (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)),

    -- Personal Services
    ('Personal Services', 'personal-services', (SELECT id FROM services_id)),
    ('Beauty & Spa', 'beauty-spa', (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1)),
    ('Fitness & Training', 'fitness-training', (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1)),
    ('Tuition & Coaching', 'tuition-coaching', (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1)),
    ('Photography', 'photography', (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1)),
    ('Travel & Tours', 'travel-tours', (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1))
) AS v(name, slug, parent_id)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = v.slug
);

-- =========================================================================
-- 2. HOME & LIVING EXPANSION - Add major subcategories
-- =========================================================================

WITH home_living_id AS (
  SELECT id FROM categories WHERE slug = 'home-living' LIMIT 1
)
INSERT INTO categories (name, slug, parent_id)
SELECT * FROM (
  VALUES
    ('Furniture', 'home-furniture', (SELECT id FROM home_living_id)),
    ('Sofas & Seating', 'sofas-seating', (SELECT id FROM categories WHERE slug = 'home-furniture' LIMIT 1)),
    ('Beds & Mattresses', 'beds-mattresses', (SELECT id FROM categories WHERE slug = 'home-furniture' LIMIT 1)),
    ('Dining & Kitchen', 'dining-kitchen', (SELECT id FROM categories WHERE slug = 'home-furniture' LIMIT 1)),
    ('Storage & Shelving', 'storage-shelving', (SELECT id FROM categories WHERE slug = 'home-furniture' LIMIT 1)),

    ('Home Appliances', 'home-appliances', (SELECT id FROM home_living_id)),
    ('Kitchen Appliances', 'kitchen-appliances', (SELECT id FROM categories WHERE slug = 'home-appliances' LIMIT 1)),
    ('Washing & Laundry', 'washing-laundry', (SELECT id FROM categories WHERE slug = 'home-appliances' LIMIT 1)),
    ('Air & Heating', 'air-heating', (SELECT id FROM categories WHERE slug = 'home-appliances' LIMIT 1)),
    ('Cooling & Refrigeration', 'cooling-refrigeration', (SELECT id FROM categories WHERE slug = 'home-appliances' LIMIT 1)),

    ('Home Décor', 'home-decor', (SELECT id FROM home_living_id)),
    ('Lighting', 'lighting', (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1)),
    ('Wall Art & Mirrors', 'wall-art-mirrors', (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1)),
    ('Carpets & Rugs', 'carpets-rugs', (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1)),
    ('Bedding & Textiles', 'bedding-textiles', (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1)),

    ('Cookware & Utensils', 'cookware-utensils', (SELECT id FROM home_living_id))
) AS v(name, slug, parent_id)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = v.slug
);

-- =========================================================================
-- 3. PETS EXPANSION - Add pet types
-- =========================================================================

WITH pets_id AS (
  SELECT id FROM categories WHERE slug = 'pets' LIMIT 1
)
INSERT INTO categories (name, slug, parent_id)
SELECT * FROM (
  VALUES
    ('Dogs', 'dogs', (SELECT id FROM pets_id)),
    ('Dogs - Puppies', 'dogs-puppies', (SELECT id FROM categories WHERE slug = 'dogs' LIMIT 1)),
    ('Dogs - Adult', 'dogs-adult', (SELECT id FROM categories WHERE slug = 'dogs' LIMIT 1)),
    ('Dogs - Breeding Stock', 'dogs-breeding', (SELECT id FROM categories WHERE slug = 'dogs' LIMIT 1)),

    ('Cats', 'cats', (SELECT id FROM pets_id)),
    ('Cats - Kittens', 'cats-kittens', (SELECT id FROM categories WHERE slug = 'cats' LIMIT 1)),
    ('Cats - Adult', 'cats-adult', (SELECT id FROM categories WHERE slug = 'cats' LIMIT 1)),

    ('Birds', 'birds', (SELECT id FROM pets_id)),
    ('Parrots & Macaws', 'parrots-macaws', (SELECT id FROM categories WHERE slug = 'birds' LIMIT 1)),
    ('Pigeons & Doves', 'pigeons-doves', (SELECT id FROM categories WHERE slug = 'birds' LIMIT 1)),

    ('Aquatic Pets', 'aquatic-pets', (SELECT id FROM pets_id)),
    ('Fish', 'fish', (SELECT id FROM categories WHERE slug = 'aquatic-pets' LIMIT 1)),
    ('Turtles & Terrapins', 'turtles-terrapins', (SELECT id FROM categories WHERE slug = 'aquatic-pets' LIMIT 1)),

    ('Small Animals', 'small-animals', (SELECT id FROM pets_id)),
    ('Rabbits', 'rabbits', (SELECT id FROM categories WHERE slug = 'small-animals' LIMIT 1)),
    ('Guinea Pigs & Hamsters', 'guinea-pigs-hamsters', (SELECT id FROM categories WHERE slug = 'small-animals' LIMIT 1)),

    ('Pet Supplies & Accessories', 'pet-supplies', (SELECT id FROM pets_id)),
    ('Pet Food', 'pet-food', (SELECT id FROM categories WHERE slug = 'pet-supplies' LIMIT 1)),
    ('Pet Cages & Accessories', 'pet-cages-accessories', (SELECT id FROM categories WHERE slug = 'pet-supplies' LIMIT 1)),
    ('Pet Grooming', 'pet-grooming', (SELECT id FROM categories WHERE slug = 'pet-supplies' LIMIT 1))
) AS v(name, slug, parent_id)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = v.slug
);

-- =========================================================================
-- 4. HEALTH & BEAUTY EXPANSION
-- =========================================================================

WITH health_beauty_id AS (
  SELECT id FROM categories WHERE slug = 'health-beauty' LIMIT 1
)
INSERT INTO categories (name, slug, parent_id)
SELECT * FROM (
  VALUES
    ('Skincare & Cosmetics', 'skincare-cosmetics', (SELECT id FROM health_beauty_id)),
    ('Face Care', 'face-care', (SELECT id FROM categories WHERE slug = 'skincare-cosmetics' LIMIT 1)),
    ('Makeup', 'makeup', (SELECT id FROM categories WHERE slug = 'skincare-cosmetics' LIMIT 1)),
    ('Body Care', 'body-care', (SELECT id FROM categories WHERE slug = 'skincare-cosmetics' LIMIT 1)),

    ('Hair Care', 'hair-care', (SELECT id FROM health_beauty_id)),
    ('Hair Products', 'hair-products', (SELECT id FROM categories WHERE slug = 'hair-care' LIMIT 1)),
    ('Hair Styling Tools', 'hair-styling-tools', (SELECT id FROM categories WHERE slug = 'hair-care' LIMIT 1)),

    ('Fragrances & Perfumes', 'fragrances-perfumes', (SELECT id FROM health_beauty_id)),

    ('Health & Wellness', 'health-wellness', (SELECT id FROM health_beauty_id)),
    ('Vitamins & Supplements', 'vitamins-supplements', (SELECT id FROM categories WHERE slug = 'health-wellness' LIMIT 1)),
    ('Medical Devices', 'medical-devices', (SELECT id FROM categories WHERE slug = 'health-wellness' LIMIT 1)),
    ('Fitness Equipment', 'fitness-equipment', (SELECT id FROM categories WHERE slug = 'health-wellness' LIMIT 1))
) AS v(name, slug, parent_id)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = v.slug
);

-- =========================================================================
-- 5. ANTIQUES & COLLECTIBLES EXPANSION
-- =========================================================================

WITH antiques_id AS (
  SELECT id FROM categories WHERE slug = 'antiques-collectibles' LIMIT 1
)
INSERT INTO categories (name, slug, parent_id)
SELECT * FROM (
  VALUES
    ('Antiques', 'antiques', (SELECT id FROM antiques_id)),
    ('Vintage Furniture', 'vintage-furniture', (SELECT id FROM categories WHERE slug = 'antiques' LIMIT 1)),
    ('Vintage Artifacts', 'vintage-artifacts', (SELECT id FROM categories WHERE slug = 'antiques' LIMIT 1)),

    ('Collectibles', 'collectibles', (SELECT id FROM antiques_id)),
    ('Coins & Currency', 'coins-currency', (SELECT id FROM categories WHERE slug = 'collectibles' LIMIT 1)),
    ('Stamps & Memorabilia', 'stamps-memorabilia', (SELECT id FROM categories WHERE slug = 'collectibles' LIMIT 1)),
    ('Trading Cards', 'trading-cards', (SELECT id FROM categories WHERE slug = 'collectibles' LIMIT 1)),
    ('Figurines & Models', 'figurines-models', (SELECT id FROM categories WHERE slug = 'collectibles' LIMIT 1))
) AS v(name, slug, parent_id)
WHERE NOT EXISTS (
  SELECT 1 FROM categories WHERE slug = v.slug
);

-- =========================================================================
-- 6. VERIFY: Check that cascading form options work correctly
-- =========================================================================
-- Form will now load options dynamically:
-- - User selects "Services" → shows Telecom & Utilities, Professional Services, etc.
-- - User selects "Telecom & Utilities" → shows Internet, Mobile, TV & Streaming, etc.
-- - Attributes are resolved by walking up category tree
-- =========================================================================
