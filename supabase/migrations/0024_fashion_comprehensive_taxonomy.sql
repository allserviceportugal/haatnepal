-- haatnepal: Fashion category comprehensive overhaul
-- Complete Fashion taxonomy (Nepal-optimized) with Allegro-quality attributes for all leaves
-- Eliminates duplicate product categories and creates unified structure

-- ---------------------------------------------------------------------------
-- PHASE 1: REBUILD FASHION TAXONOMY
-- ---------------------------------------------------------------------------

-- Delete existing Fashion children (keeping Fashion top-level for backward compatibility)
delete from public.categories
where parent_id = (select id from public.categories where slug = 'fashion');

-- Tier 1: Main fashion departments under Fashion
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion'), name, slug
from (values
  ('Women''s Fashion', 'fashion-women'),
  ('Men''s Fashion', 'fashion-men'),
  ('Kids & Baby Fashion', 'fashion-kids'),
  ('Traditional & Ethnic Wear', 'fashion-ethnic'),
  ('Watches', 'fashion-watches'),
  ('Jewelry', 'fashion-jewelry'),
  ('Bags & Luggage', 'fashion-bags'),
  ('Accessories', 'fashion-accessories')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Women's Fashion leaves
-- ---------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-women'), name, slug
from (values
  ('Western Tops & Shirts', 'womens-tops-shirts'),
  ('Dresses', 'womens-dresses'),
  ('Bottoms (Pants, Jeans, Skirts)', 'womens-bottoms'),
  ('Sarees', 'womens-sarees'),
  ('Kurtas & Kurtis', 'womens-kurtas'),
  ('Suits & Salwar Kameez', 'womens-suits'),
  ('Jackets & Coats', 'womens-jackets-coats'),
  ('Blazers & Formal', 'womens-blazers'),
  ('Lehengas', 'womens-lehengas'),
  ('Traditional Wear (Other)', 'womens-traditional-other'),
  ('Activewear & Sportswear', 'womens-activewear'),
  ('Innerwear & Sleepwear', 'womens-innerwear'),
  ('Winter Wear', 'womens-winter-wear'),
  ('Shoes', 'womens-shoes'),
  ('Accessories', 'womens-fashion-accessories')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Men's Fashion leaves
-- ---------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-men'), name, slug
from (values
  ('Shirts & Tops', 'mens-shirts-tops'),
  ('T-Shirts & Polos', 'mens-tshirts-polos'),
  ('Pants & Jeans', 'mens-pants-jeans'),
  ('Shorts', 'mens-shorts'),
  ('Kurtas & Kurta Suruwal', 'mens-kurtas'),
  ('Daura Suruwal', 'mens-daura-suruwal'),
  ('Jackets & Coats', 'mens-jackets-coats'),
  ('Blazers & Formal', 'mens-blazers'),
  ('Activewear & Sportswear', 'mens-activewear'),
  ('Innerwear & Sleepwear', 'mens-innerwear'),
  ('Winter Wear', 'mens-winter-wear'),
  ('Shoes', 'mens-shoes'),
  ('Accessories', 'mens-fashion-accessories')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Kids & Baby Fashion leaves
-- ---------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-kids'), name, slug
from (values
  ('Baby Clothing (0-12 months)', 'baby-clothing-0-12'),
  ('Toddler Clothing (1-3 years)', 'toddler-clothing-1-3'),
  ('Kids Clothing (3-8 years)', 'kids-clothing-3-8'),
  ('Kids Clothing (8+ years)', 'kids-clothing-8plus'),
  ('Kids Shoes', 'kids-shoes'),
  ('Kids Accessories', 'kids-accessories'),
  ('School Uniforms', 'kids-uniforms')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- Traditional & Ethnic Wear leaves
-- ---------------------------------------------------------------------------
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-ethnic'), name, slug
from (values
  ('Sarees (All Types)', 'ethnic-sarees'),
  ('Lehengas & Chaniya Choli', 'ethnic-lehengas'),
  ('Kurtas & Kurtis (All Types)', 'ethnic-kurtas'),
  ('Salwar Kameez & Suits', 'ethnic-salwar-kameez'),
  ('Kurta Suruwal & Daura Suruwal', 'ethnic-nepali-wear'),
  ('Cholis & Blouses', 'ethnic-blouses'),
  ('Ethnic Shawls & Wraps', 'ethnic-shawls'),
  ('Wedding & Bridal Wear', 'ethnic-bridal'),
  ('Fabrics & Materials (Ethnic)', 'ethnic-fabrics')
) as t(name, slug);

-- Watches as standalone department (important in Fashion)
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-watches'), name, slug
from (values
  ('Men''s Watches', 'mens-watches'),
  ('Women''s Watches', 'womens-watches'),
  ('Smart Watches', 'smart-watches'),
  ('Kids Watches', 'kids-watches')
) as t(name, slug);

-- Jewelry department
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-jewelry'), name, slug
from (values
  ('Rings', 'jewelry-rings'),
  ('Necklaces & Pendants', 'jewelry-necklaces'),
  ('Bracelets & Bangles', 'jewelry-bracelets'),
  ('Earrings', 'jewelry-earrings'),
  ('Sets', 'jewelry-sets'),
  ('Anklets & Toe Rings', 'jewelry-anklets'),
  ('Brooches & Clips', 'jewelry-brooches'),
  ('Gemstones & Loose Stones', 'jewelry-gemstones')
) as t(name, slug);

-- Bags & Luggage department
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-bags'), name, slug
from (values
  ('Handbags & Purses', 'bags-handbags'),
  ('Backpacks', 'bags-backpacks'),
  ('Slingbags & Crossbody', 'bags-slingbags'),
  ('Clutches & Wallets', 'bags-clutches'),
  ('Travelugage & Duffels', 'bags-travel'),
  ('Laptop & Business Bags', 'bags-laptop'),
  ('Sports Bags', 'bags-sports')
) as t(name, slug);

-- Accessories department
insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'fashion-accessories'), name, slug
from (values
  ('Belts', 'accessories-belts'),
  ('Scarves & Stoles', 'accessories-scarves'),
  ('Hats & Caps', 'accessories-hats'),
  ('Sunglasses & Eyewear', 'accessories-eyewear'),
  ('Hair Accessories', 'accessories-hair'),
  ('Gloves & Mittens', 'accessories-gloves'),
  ('Socks & Stockings', 'accessories-socks'),
  ('Handkerchiefs & Ties', 'accessories-ties')
) as t(name, slug);

-- ---------------------------------------------------------------------------
-- PHASE 2: SIZE SYSTEM (structured, not free text)
-- ---------------------------------------------------------------------------

-- Women's Clothing sizes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'size', 'Size', 'select'::public.attribute_input_type, '["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size", "Custom"]'::jsonb, false, 1
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-jackets-coats', 'womens-blazers', 'womens-activewear', 'womens-innerwear', 'womens-winter-wear', 'womens-kurtas', 'womens-lehengas', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez', 'ethnic-blouses');

-- Men's Clothing sizes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'size', 'Size', 'select'::public.attribute_input_type, '["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size", "Custom"]'::jsonb, false, 1
from public.categories c
where c.slug in ('mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-shorts', 'mens-kurtas', 'mens-daura-suruwal', 'mens-jackets-coats', 'mens-blazers', 'mens-activewear', 'mens-innerwear', 'mens-winter-wear', 'ethnic-nepali-wear');

-- Kids clothing sizes (age-based for 0-12, size for 8+)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'size', 'Age / Size', 'select'::public.attribute_input_type, '["Newborn", "0-3 months", "3-6 months", "6-12 months", "12-18 months", "18-24 months", "2-3 years", "3-4 years", "4-5 years", "5-6 years", "6-7 years", "7-8 years", "8 years", "10 years", "12 years"]'::jsonb, false, 1
from public.categories c
where c.slug in ('baby-clothing-0-12', 'toddler-clothing-1-3', 'kids-clothing-3-8', 'kids-clothing-8plus');

-- Shoe sizes (multiple systems supported)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'size', 'Shoe Size', 'select'::public.attribute_input_type, '["EU 35", "EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45", "EU 46", "UK 3", "UK 3.5", "UK 4", "UK 4.5", "UK 5", "UK 5.5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "US 5", "US 5.5", "US 6", "US 6.5", "US 7", "US 7.5", "US 8", "US 8.5", "US 9", "US 9.5", "US 10", "US 11", "US 12", "US 13"]'::jsonb, false, 1
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'kids-shoes');

-- Watch sizes (where applicable)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'strap_size', 'Strap / Band Size', 'select'::public.attribute_input_type, '["One Size", "XS", "S", "M", "L", "XL", "Adjustable"]'::jsonb, false, 8
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'kids-watches');

-- ---------------------------------------------------------------------------
-- PHASE 3: COLOR SYSTEM (structured vocabulary)
-- ---------------------------------------------------------------------------

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'color', 'Primary Color', 'select'::public.attribute_input_type, '["Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Beige", "Grey", "Silver", "Gold", "Maroon", "Navy", "Cream", "Khaki", "Olive", "Teal", "Burgundy", "Turquoise", "Multicolor", "Other"]'::jsonb, false, 2
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-jackets-coats', 'womens-blazers', 'womens-lehengas', 'womens-kurtas', 'womens-activewear', 'womens-winter-wear', 'mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-shorts', 'mens-kurtas', 'mens-daura-suruwal', 'mens-jackets-coats', 'mens-blazers', 'mens-activewear', 'mens-winter-wear', 'kids-clothing-3-8', 'kids-clothing-8plus', 'baby-clothing-0-12', 'toddler-clothing-1-3', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez', 'ethnic-blouses', 'ethnic-nepali-wear');

-- Secondary color for patterns/combinations
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'secondary_color', 'Secondary Color (if any)', 'select'::public.attribute_input_type, '["None", "Black", "White", "Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Beige", "Grey", "Silver", "Gold", "Other"]'::jsonb, false, 3
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-lehengas', 'womens-kurtas', 'mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-kurtas', 'kids-clothing-3-8', 'kids-clothing-8plus', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez');

-- Shoes and accessories color
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'color', 'Color', 'select'::public.attribute_input_type, '["Black", "White", "Red", "Blue", "Green", "Brown", "Beige", "Grey", "Silver", "Gold", "Maroon", "Navy", "Cream", "Multicolor", "Other"]'::jsonb, false, 2
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'kids-shoes', 'bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'accessories-belts', 'accessories-scarves', 'accessories-hats');

-- Jewelry color
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'color', 'Color / Finish', 'select'::public.attribute_input_type, '["Gold", "Silver", "Rose Gold", "White Gold", "Platinum", "Bronze", "Copper", "Two-Tone", "Multi-Tone", "Other"]'::jsonb, false, 5
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

-- Watch color
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'dial_color', 'Dial Color', 'select'::public.attribute_input_type, '["Black", "White", "Silver", "Gold", "Rose Gold", "Blue", "Brown", "Grey", "Multi-color", "Other"]'::jsonb, false, 6
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

-- ---------------------------------------------------------------------------
-- PHASE 4: FABRIC & MATERIAL SYSTEM
-- ---------------------------------------------------------------------------

-- Clothing fabric
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'fabric', 'Fabric / Material', 'select'::public.attribute_input_type, '["Cotton", "Organic Cotton", "Silk", "Linen", "Wool", "Cashmere", "Polyester", "Nylon", "Rayon", "Viscose", "Denim", "Suede", "Velvet", "Chiffon", "Georgette", "Satin", "Lace", "Spandex/Elastane", "Acrylic", "Blended", "Other"]'::jsonb, false, 4
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-jackets-coats', 'womens-blazers', 'womens-lehengas', 'womens-kurtas', 'womens-activewear', 'womens-innerwear', 'womens-winter-wear', 'mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-shorts', 'mens-kurtas', 'mens-daura-suruwal', 'mens-jackets-coats', 'mens-blazers', 'mens-activewear', 'mens-innerwear', 'mens-winter-wear', 'kids-clothing-3-8', 'kids-clothing-8plus', 'baby-clothing-0-12', 'toddler-clothing-1-3', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez', 'ethnic-blouses', 'ethnic-nepali-wear');

-- Saree-specific fabric (more options)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'saree_fabric', 'Saree Fabric', 'select'::public.attribute_input_type, '["Silk", "Cotton", "Georgette", "Chiffon", "Net", "Organza", "Banarasi", "Chanderi", "Kota Doria", "Tant", "Linen", "Tussar", "Pattola", "Paithani", "Kanjivaram", "Maheshwari", "Uppada", "Jamdani", "Dhaka", "Tant", "Blended", "Other"]'::jsonb, false, 5
from public.categories c
where c.slug in ('womens-sarees', 'ethnic-sarees');

-- Shoe material
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'material', 'Upper Material', 'select'::public.attribute_input_type, '["Leather", "Synthetic", "Canvas", "Suede", "Mesh", "Fabric", "Rubber", "Velvet", "Other"]'::jsonb, false, 3
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'kids-shoes');

-- Bag material
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'material', 'Material', 'select'::public.attribute_input_type, '["Leather", "Vegan Leather", "Canvas", "Polyester", "Nylon", "Jute", "Cotton", "Suede", "Rubber", "Hybrid", "Other"]'::jsonb, false, 3
from public.categories c
where c.slug in ('bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'bags-travel', 'bags-laptop', 'bags-sports');

-- Jewelry material
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'metal', 'Metal Type', 'select'::public.attribute_input_type, '["Gold", "Silver", "Platinum", "Stainless Steel", "Brass", "Copper", "Bronze", "Artificial", "Alloy", "Other"]'::jsonb, false, 4
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

-- Jewelry purity (for precious metals)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'purity', 'Purity (if applicable)', 'select'::public.attribute_input_type, '["24K", "22K", "21K", "18K", "14K", "10K", "9K", "925 (Silver)", "999 (Silver)", "Other", "Not Applicable"]'::jsonb, false, 5
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

-- Watch strap material
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'strap_material', 'Strap Material', 'select'::public.attribute_input_type, '["Leather", "Stainless Steel", "Rubber", "Fabric", "Silicone", "Mesh", "Other"]'::jsonb, false, 7
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

-- ---------------------------------------------------------------------------
-- PHASE 5: PATTERN & STYLE ATTRIBUTES
-- ---------------------------------------------------------------------------

-- Pattern for clothing
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'pattern', 'Pattern', 'select'::public.attribute_input_type, '["Solid", "Printed", "Striped", "Checkered", "Floral", "Geometric", "Abstract", "Animal Print", "Tie-Dye", "Embroidered", "Other"]'::jsonb, false, 5
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'mens-shirts-tops', 'mens-tshirts-polos', 'kids-clothing-3-8', 'kids-clothing-8plus');

-- Neckline for women's clothing
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'neckline', 'Neckline', 'select'::public.attribute_input_type, '["Round", "V-neck", "Boat", "Square", "Sweetheart", "Halter", "Off-shoulder", "Turtleneck", "Other"]'::jsonb, false, 6
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-activewear', 'womens-innerwear');

-- Collar for men's shirts
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'collar_type', 'Collar Type', 'select'::public.attribute_input_type, '["Spread", "Point", "Club", "Button Down", "Casual", "Mandarin", "Other"]'::jsonb, false, 5
from public.categories c
where c.slug in ('mens-shirts-tops');

-- Sleeve type
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'sleeve', 'Sleeve Type', 'select'::public.attribute_input_type, '["Short", "3/4", "Long", "Sleeveless", "Cap", "Flutter", "Bell"]'::jsonb, false, 6
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-kurtas', 'womens-suits', 'mens-shirts-tops', 'mens-kurtas', 'ethnic-kurtas', 'ethnic-salwar-kameez');

-- Fit (for clothing)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'fit', 'Fit', 'select'::public.attribute_input_type, '["Slim", "Regular", "Loose", "Skinny", "Straight", "Boyfriend", "Oversized"]'::jsonb, false, 7
from public.categories c
where c.slug in ('womens-bottoms', 'womens-suits', 'mens-pants-jeans', 'mens-shorts');

-- Occasion
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'occasion', 'Occasion', 'select'::public.attribute_input_type, '["Casual", "Formal", "Party", "Wedding", "Festival", "Office", "Sportswear", "Daily Wear"]'::jsonb, false, 8
from public.categories c
where c.slug in ('womens-dresses', 'womens-lehengas', 'womens-blazers', 'womens-jackets-coats', 'womens-suits', 'women-kurtas', 'mens-blazers', 'mens-jackets-coats', 'ethnic-bridal', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez');

-- Season
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'season', 'Season', 'select'::public.attribute_input_type, '["Spring", "Summer", "Monsoon", "Autumn", "Winter", "All Season"]'::jsonb, false, 9
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-bottoms', 'womens-jackets-coats', 'womens-activewear', 'womens-winter-wear', 'mens-shirts-tops', 'mens-pants-jeans', 'mens-jackets-coats', 'mens-activewear', 'mens-winter-wear', 'ethnic-sarees', 'ethnic-lehengas');

-- ---------------------------------------------------------------------------
-- PHASE 6: BRAND & AUTHENTICITY
-- ---------------------------------------------------------------------------

-- Brand for all fashion categories
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'brand', 'Brand', 'select'::public.attribute_input_type, '["Nike", "Adidas", "Puma", "Zara", "H&M", "Uniqlo", "Tommy Hilfiger", "Calvin Klein", "Levi''s", "ASOS", "Forever 21", "Gap", "Marks & Spencer", "LocalBrand", "Handmade", "Unbranded", "Other"]'::jsonb, false, 0
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-jackets-coats', 'womens-blazers', 'womens-lehengas', 'womens-kurtas', 'womens-activewear', 'womens-innerwear', 'womens-winter-wear', 'womens-shoes', 'mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-shorts', 'mens-kurtas', 'mens-daura-suruwal', 'mens-jackets-coats', 'mens-blazers', 'mens-activewear', 'mens-innerwear', 'mens-winter-wear', 'mens-shoes', 'kids-clothing-3-8', 'kids-clothing-8plus', 'kids-shoes', 'bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'bags-travel', 'bags-laptop', 'bags-sports');

-- Brand for watches
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'brand', 'Brand', 'select'::public.attribute_input_type, '["Apple", "Samsung", "Xiaomi", "Amazfit", "Huawei", "Noise", "boAt", "Fossil", "Timex", "Seiko", "Orient", "Titan", "Fastrack", "Casio", "G-Shock", "Rolex", "Omega", "Local Brand", "Unbranded", "Other"]'::jsonb, false, 1
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

-- Brand for jewelry
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'brand', 'Brand (if applicable)', 'select'::public.attribute_input_type, '["Designer Brand", "Local Artisan", "Handmade", "Unbranded", "Other"]'::jsonb, false, 1
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

-- Authenticity status
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'authenticity', 'Authenticity Status', 'select'::public.attribute_input_type, '["Original / Authentic", "Unbranded", "Handmade", "Not Applicable"]'::jsonb, false, 11
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'bags-travel', 'bags-laptop', 'bags-sports', 'mens-watches', 'womens-watches', 'smart-watches');

-- ---------------------------------------------------------------------------
-- PHASE 7: CONDITION (for used items)
-- ---------------------------------------------------------------------------

-- Condition for all leaves (new/used already exists in listing table, this is for describing wear)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'condition_detail', 'Condition Level', 'select'::public.attribute_input_type, '["New with Tags", "New without Tags", "Like New", "Excellent", "Good", "Fair", "Poor"]'::jsonb, false, 12
from public.categories c
where c.slug in ('womens-tops-shirts', 'womens-dresses', 'womens-bottoms', 'womens-suits', 'womens-jackets-coats', 'womens-blazers', 'womens-lehengas', 'womens-kurtas', 'womens-activewear', 'womens-innerwear', 'womens-winter-wear', 'womens-shoes', 'womens-fashion-accessories', 'mens-shirts-tops', 'mens-tshirts-polos', 'mens-pants-jeans', 'mens-shorts', 'mens-kurtas', 'mens-daura-suruwal', 'mens-jackets-coats', 'mens-blazers', 'mens-activewear', 'mens-innerwear', 'mens-winter-wear', 'mens-shoes', 'mens-fashion-accessories', 'kids-clothing-3-8', 'kids-clothing-8plus', 'kids-shoes', 'kids-accessories', 'ethnic-sarees', 'ethnic-lehengas', 'ethnic-kurtas', 'ethnic-salwar-kameez', 'ethnic-blouses', 'ethnic-nepali-wear', 'bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'bags-travel', 'bags-laptop', 'bags-sports', 'jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches', 'mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

-- Special handling for sarees: embroidery, border, blouse
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'saree_type', 'Saree Type', 'select'::public.attribute_input_type, '["Pure Silk", "Cotton Silk", "Pure Cotton", "Georgette", "Chiffon", "Synthetic", "Blended", "Other"]'::jsonb, false, 6
from public.categories c
where c.slug in ('womens-sarees', 'ethnic-sarees');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'embroidery', 'Embroidery / Work', 'select'::public.attribute_input_type, '["No Embroidery", "Hand Embroidered", "Machine Embroidered", "Zari Work", "Mirror Work", "Beadwork", "Sequins", "Mixed"]'::jsonb, false, 7
from public.categories c
where c.slug in ('womens-sarees', 'ethnic-sarees', 'ethnic-lehengas');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'blouse_included', 'Blouse Included', 'boolean'::public.attribute_input_type, null, false, 8
from public.categories c
where c.slug in ('womens-sarees', 'ethnic-sarees');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'stitched_status', 'Stitched / Unstitched', 'select'::public.attribute_input_type, '["Stitched", "Unstitched", "Semi-Stitched"]'::jsonb, false, 9
from public.categories c
where c.slug in ('womens-suits', 'ethnic-salwar-kameez', 'ethnic-blouses', 'womens-lehengas', 'ethnic-lehengas');

-- Shoe-specific attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'shoe_type', 'Shoe Type', 'select'::public.attribute_input_type, '["Casual", "Formal", "Sports", "Sandals", "Flip-Flops", "Heels", "Boots", "Loafers", "Sneakers", "Other"]'::jsonb, false, 2
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'kids-shoes');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'heel_height', 'Heel Height (Women''s)', 'select'::public.attribute_input_type, '["Flat", "Low (1-2 inch)", "Medium (2-3 inch)", "High (3+ inch)", "N/A"]'::jsonb, false, 4
from public.categories c
where c.slug in ('womens-shoes');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'closure', 'Closure Type', 'select'::public.attribute_input_type, '["Lace-up", "Zip", "Buckle", "Velcro", "Slip-on", "Buckle & Strap"]'::jsonb, false, 5
from public.categories c
where c.slug in ('womens-shoes', 'mens-shoes', 'kids-shoes');

-- Bag-specific attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'bag_type', 'Bag Type', 'select'::public.attribute_input_type, '["Tote", "Shoulder Bag", "Clutch", "Crossbody", "Backpack", "Duffel", "Briefcase", "Carry-on", "Other"]'::jsonb, false, 1
from public.categories c
where c.slug in ('bags-handbags', 'bags-backpacks', 'bags-slingbags', 'bags-clutches', 'bags-travel', 'bags-laptop', 'bags-sports');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'capacity_liters', 'Capacity (if applicable)', 'select'::public.attribute_input_type, '["< 10L", "10-20L", "20-30L", "30-40L", "40L+", "N/A"]'::jsonb, false, 4
from public.categories c
where c.slug in ('bags-backpacks', 'bags-slingbags', 'bags-travel', 'bags-sports');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'laptop_compatible', 'Laptop Friendly', 'boolean'::public.attribute_input_type, null, false, 5
from public.categories c
where c.slug in ('bags-backpacks', 'bags-slingbags', 'bags-travel', 'bags-laptop');

-- Watch-specific attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'movement', 'Movement Type', 'select'::public.attribute_input_type, '["Quartz", "Automatic", "Manual", "Solar", "Smart (Digital)", "Smartwatch"]'::jsonb, false, 2
from public.categories c
where c.slug in ('mens-watches', 'womens-watches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'display', 'Display Type', 'select'::public.attribute_input_type, '["Analog", "Digital", "Hybrid", "AMOLED", "E-Ink", "LCD"]'::jsonb, false, 3
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'case_material', 'Case Material', 'select'::public.attribute_input_type, '["Stainless Steel", "Leather", "Rubber", "Plastic", "Titanium", "Gold", "Silver", "Ceramics", "Other"]'::jsonb, false, 4
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'water_resistance', 'Water Resistance', 'select'::public.attribute_input_type, '["Not Water Resistant", "3 ATM", "5 ATM", "10 ATM", "20 ATM", "Diving (100+m)"]'::jsonb, false, 8
from public.categories c
where c.slug in ('mens-watches', 'womens-watches', 'smart-watches', 'kids-watches');

-- Jewelry-specific attributes
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'jewelry_type', 'Jewelry Type', 'select'::public.attribute_input_type, '["Solitaire", "Cluster", "Studded", "Plain", "Designer", "Handmade", "Vintage"]'::jsonb, false, 2
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'stone_type', 'Stone Type (if any)', 'select'::public.attribute_input_type, '["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl", "Coral", "Turquoise", "Semi-Precious", "Glass / Artificial", "None"]'::jsonb, false, 6
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'handmade', 'Handmade', 'boolean'::public.attribute_input_type, null, false, 7
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'weight_grams', 'Weight (grams)', 'number'::public.attribute_input_type, null, false, 8
from public.categories c
where c.slug in ('jewelry-rings', 'jewelry-necklaces', 'jewelry-bracelets', 'jewelry-earrings', 'jewelry-sets', 'jewelry-anklets', 'jewelry-brooches');

-- Gemstones category
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'stone_name', 'Stone Type', 'select'::public.attribute_input_type, '["Diamond", "Emerald", "Ruby", "Sapphire", "Pearl", "Coral", "Turquoise", "Jade", "Amethyst", "Topaz", "Garnet", "Opal", "Moonstone", "Other"]'::jsonb, false, 1
from public.categories c
where c.slug in ('jewelry-gemstones');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'stone_color', 'Color', 'select'::public.attribute_input_type, '["Clear", "White", "Yellow", "Blue", "Red", "Pink", "Green", "Purple", "Brown", "Black", "Multi-color", "Other"]'::jsonb, false, 2
from public.categories c
where c.slug in ('jewelry-gemstones');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'stone_shape', 'Shape', 'select'::public.attribute_input_type, '["Round", "Oval", "Emerald", "Cushion", "Heart", "Pear", "Marquise", "Radiant", "Asscher", "Square", "Briolette", "Other"]'::jsonb, false, 3
from public.categories c
where c.slug in ('jewelry-gemstones');

insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select c.id, 'certification', 'Certification', 'boolean'::public.attribute_input_type, null, false, 4
from public.categories c
where c.slug in ('jewelry-gemstones');
