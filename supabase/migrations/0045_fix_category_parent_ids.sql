-- Fix migration 0044 bug: reparent all branch categories that were inserted with parent_id = NULL
-- Root cause: 0044 tried to insert subcategories and branches in one statement, but Postgres
-- evaluates all subqueries before the INSERT begins, so branch lookups found no parent and got NULL.
-- Solution: Use separate UPDATEs (after branches are already committed rows) to set correct parents.

-- Services → Telecom & Utilities
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'telecom-utilities' LIMIT 1)
WHERE slug IN ('internet-broadband','mobile-services','tv-streaming','electricity-gas','water-plumbing');

-- Services → Professional Services
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'professional-services' LIMIT 1)
WHERE slug IN ('consulting','accounting-tax');

-- Services → Home Services
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'home-services' LIMIT 1)
WHERE slug IN ('repair-maintenance','plumbing-hvac','electrical-services','painting-decor');

-- Services → Personal Services
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'personal-services' LIMIT 1)
WHERE slug IN ('beauty-spa','fitness-training','tuition-coaching','photography','travel-tours');

-- Home & Living → Furniture
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'home-furniture' LIMIT 1)
WHERE slug IN ('sofas-seating','beds-mattresses','dining-kitchen','storage-shelving');

-- Home & Living → Home Appliances
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'home-appliances' LIMIT 1)
WHERE slug IN ('kitchen-appliances','washing-laundry','air-heating','cooling-refrigeration');

-- Home & Living → Home Décor
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'home-decor' LIMIT 1)
WHERE slug IN ('lighting','wall-art-mirrors','carpets-rugs','bedding-textiles');

-- Pets → Dogs
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'dogs' LIMIT 1)
WHERE slug IN ('dogs-puppies','dogs-adult','dogs-breeding');

-- Pets → Cats
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'cats' LIMIT 1)
WHERE slug IN ('cats-kittens','cats-adult');

-- Pets → Birds
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'birds' LIMIT 1)
WHERE slug IN ('parrots-macaws','pigeons-doves');

-- Pets → Aquatic Pets
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'aquatic-pets' LIMIT 1)
WHERE slug IN ('fish','turtles-terrapins');

-- Pets → Small Animals
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'small-animals' LIMIT 1)
WHERE slug IN ('rabbits','guinea-pigs-hamsters');

-- Pets → Pet Supplies & Accessories
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'pet-supplies' LIMIT 1)
WHERE slug IN ('pet-food','pet-cages-accessories','pet-grooming');

-- Health & Beauty → Skincare & Cosmetics
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'skincare-cosmetics' LIMIT 1)
WHERE slug IN ('face-care','makeup','body-care');

-- Health & Beauty → Hair Care
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'hair-care' LIMIT 1)
WHERE slug IN ('hair-products','hair-styling-tools');

-- Health & Beauty → Health & Wellness
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'health-wellness' LIMIT 1)
WHERE slug IN ('vitamins-supplements','medical-devices');

-- Antiques & Collectibles → Antiques
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'antiques' LIMIT 1)
WHERE slug IN ('vintage-furniture','vintage-artifacts');

-- Antiques & Collectibles → Collectibles
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE slug = 'collectibles' LIMIT 1)
WHERE slug IN ('coins-currency','stamps-memorabilia','trading-cards','figurines-models');

-- Result: 15 main categories restored, with all branches properly nested under their subcategories
