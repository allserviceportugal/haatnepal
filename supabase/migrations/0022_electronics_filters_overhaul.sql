-- haatnepal: Electronics category overhaul — comprehensive, Allegro-quality
-- structured filters for all 25 Electronics leaves + favorites-count view.

-- ---------------------------------------------------------------------------
-- Phones & Accessories: smartwatches, tablets, mobile-accessories, cases
-- ---------------------------------------------------------------------------

-- Enhance smartphones: add screen_size, battery_capacity, network, color
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'smartphones'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('screen_size', 'Screen Size', 'select', '["5.5\"", "6.1\"", "6.4\"", "6.7\"", "6.9\"+"]', false, 5),
  ('battery_capacity', 'Battery Capacity', 'select', '["<4000 mAh", "4000-4999 mAh", "5000-5999 mAh", "6000+ mAh"]', false, 6),
  ('network', 'Network', 'select', '["4G", "5G"]', false, 7),
  ('color', 'Color', 'select', '["Black", "White", "Blue", "Red", "Green", "Grey", "Purple", "Gold", "Silver", "Other"]', false, 8)
) as t(key, label, input_type, options, is_required, sort_order);

-- Smartwatches (new leaf)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'smartwatches'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Apple", "Samsung", "Xiaomi", "Amazfit", "Huawei", "Noise", "boAt", "Other"]', true, 1),
  ('compatibility', 'Compatibility', 'select', '["Android", "iOS", "Both"]', false, 2),
  ('display_type', 'Display Type', 'select', '["AMOLED", "LCD", "OLED"]', false, 3),
  ('battery_life', 'Battery Life', 'select', '["<3 days", "3-7 days", "7-14 days", "14+ days"]', false, 4),
  ('waterproof', 'Waterproof', 'boolean', null, false, 5),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

-- Tablets (electronics-tablets)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'electronics-tablets'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Apple", "Samsung", "Xiaomi", "Lenovo", "OnePlus", "Realme", "Other"]', true, 1),
  ('storage', 'Storage', 'select', '["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]', false, 2),
  ('ram', 'RAM', 'select', '["2GB", "4GB", "6GB", "8GB", "12GB", "16GB"]', false, 3),
  ('screen_size', 'Screen Size', 'select', '["7\"", "8\"", "10\"", "12\"", "13\"+"]', false, 4),
  ('connectivity', 'Connectivity', 'select', '["WiFi only", "WiFi + Cellular"]', false, 5),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

-- Mobile Accessories
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'mobile-accessories'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Charger", "Power Bank", "Cable", "Earphones", "Bluetooth Speaker", "Selfie Stick", "Mount", "Other"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('compatible_model', 'Compatible Model', 'text', null, false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Cases & Covers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'cases-covers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('compatible_brand', 'Compatible Brand', 'select', '["Apple", "Samsung", "Xiaomi", "OnePlus", "Google", "Realme", "Other"]', true, 1),
  ('compatible_model', 'Compatible Model', 'text', null, false, 2),
  ('material', 'Material', 'select', '["Silicone", "Leather", "Plastic", "Hybrid", "Metal"]', false, 3),
  ('case_type', 'Case Type', 'select', '["Back Cover", "Flip Cover", "Full Body", "Wallet Case", "Bumper"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Computers: laptops (enrich), desktop, components, accessories, printers
-- ---------------------------------------------------------------------------

-- Enhance laptops
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'laptops'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('processor', 'Processor', 'select', '["Intel Core i3", "Intel Core i5", "Intel Core i7", "Intel Core i9", "AMD Ryzen 5", "AMD Ryzen 7", "AMD Ryzen 9", "Apple M-series", "Other"]', false, 5),
  ('screen_size', 'Screen Size', 'select', '["13\"", "14\"", "15.6\"", "17\""]', false, 6),
  ('graphics', 'Graphics', 'select', '["Integrated", "Dedicated"]', false, 7),
  ('os', 'Operating System', 'select', '["Windows", "macOS", "ChromeOS", "Linux", "No OS"]', false, 8)
) as t(key, label, input_type, options, is_required, sort_order);

-- Laptop Parts
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'laptop-parts'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('part_type', 'Part Type', 'select', '["Battery", "Charger / Adapter", "Keyboard", "RAM Module", "SSD / HDD", "Screen / Display", "Fan / Heatsink", "Other"]', true, 1),
  ('compatible_brand', 'Compatible Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Enhance desktop computers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'desktop-computers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('graphics_card', 'Graphics Card', 'select', '["Integrated", "GTX 1650", "GTX 1660", "RTX 3060", "RTX 3070", "RTX 4060", "Radeon", "Other"]', false, 5),
  ('form_factor', 'Form Factor', 'select', '["Tower", "Mini PC", "All-in-One"]', false, 6)
) as t(key, label, input_type, options, is_required, sort_order);

-- Computer Components
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'computer-components'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('component_type', 'Component Type', 'select', '["Motherboard", "Graphics Card", "RAM", "SSD / HDD", "Power Supply", "CPU", "Cabinet / Case", "Cooling", "Monitor", "Keyboard / Mouse", "Other"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Printers & Scanners
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'printers-scanners'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Inkjet", "Laser", "All-in-One", "Scanner", "Photo Printer", "3D Printer"]', true, 1),
  ('connectivity', 'Connectivity', 'select', '["USB", "WiFi", "Both"]', false, 2),
  ('brand', 'Brand', 'select', '["HP", "Canon", "Epson", "Brother", "Other"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- TVs & Home Entertainment
-- ---------------------------------------------------------------------------

-- Enhance televisions
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'televisions'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('display_type', 'Display Type', 'select', '["LED", "QLED", "OLED", "Mini-LED"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Projectors
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'projectors'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, false, 1),
  ('resolution', 'Resolution', 'select', '["720p", "1080p", "4K"]', false, 2),
  ('brightness', 'Brightness', 'select', '["<2000 lumens", "2000-3000 lumens", "3000+ lumens"]', false, 3),
  ('throw_type', 'Throw Type', 'select', '["Standard", "Short Throw"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Headphones
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'headphones'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["In-Ear", "On-Ear", "Over-Ear", "True Wireless", "Neckband"]', true, 1),
  ('connectivity', 'Connectivity', 'select', '["Wired", "Bluetooth", "Both"]', false, 2),
  ('noise_cancellation', 'Noise Cancellation', 'boolean', null, false, 3),
  ('brand', 'Brand', 'select', '["JBL", "Sony", "boAt", "Skullcandy", "Apple", "Samsung", "Sennheiser", "Other"]', false, 4),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 5)
) as t(key, label, input_type, options, is_required, sort_order);

-- Home Audio
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'home-audio'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Bluetooth Speaker", "Soundbar", "Home Theater System", "Party Speaker", "Bookshelf Speaker"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('power', 'Power Output', 'select', '["<50W", "50-100W", "100-200W", "200W+"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Home Cinema
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'home-cinema'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('channels', 'Channels', 'select', '["2.1", "5.1", "7.1", "Other"]', false, 1),
  ('connectivity', 'Connectivity', 'select', '["Bluetooth", "HDMI ARC", "Optical", "Multiple"]', false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Gaming Consoles
-- ---------------------------------------------------------------------------

-- PlayStation 5
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'playstation-5'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('edition', 'Edition', 'select', '["Digital Edition", "Disc Edition"]', true, 1),
  ('storage', 'Storage Expansion', 'select', '["None", "500GB SSD", "1TB SSD", "2TB SSD"]', false, 2),
  ('included_accessories', 'Included Accessories', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Xbox Series X/S
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'xbox-series'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('edition', 'Edition', 'select', '["Xbox Series S", "Xbox Series X"]', true, 1),
  ('storage_expansion', 'Storage Expansion', 'select', '["None", "1TB Expansion Card"]', false, 2),
  ('included_accessories', 'Included Accessories', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- PlayStation 4
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'playstation-4'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('edition', 'Edition', 'select', '["PS4 Slim", "PS4 Pro", "PS4 Standard"]', false, 1),
  ('storage', 'Storage', 'select', '["500GB", "1TB"]', false, 2),
  ('included_accessories', 'Included Accessories', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Xbox One
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'xbox-one'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('edition', 'Edition', 'select', '["Xbox One S", "Xbox One X"]', false, 1),
  ('storage', 'Storage', 'select', '["500GB", "1TB", "2TB"]', false, 2),
  ('included_accessories', 'Included Accessories', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Nintendo Switch
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'nintendo-switch'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('model', 'Model', 'select', '["Nintendo Switch", "Nintendo Switch OLED", "Nintendo Switch Lite"]', true, 1),
  ('color', 'Color', 'select', '["White", "Black", "Gray", "Red", "Blue", "Neon", "Other"]', false, 2),
  ('included_accessories', 'Included Accessories', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Small Appliances
-- ---------------------------------------------------------------------------

-- Air Fryers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'air-fryers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Philips", "Xiaomi", "Cosori", "Local Brand", "Other"]', false, 1),
  ('capacity', 'Capacity', 'select', '["2-3L", "3-4L", "4-5L", "5L+"]', false, 2),
  ('power', 'Power (Watts)', 'select', '["<1200W", "1200-1500W", "1500W+"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Vacuum Cleaners
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'vacuum-cleaners'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Upright", "Canister", "Robot", "Handheld", "Cordless"]', true, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Kitchen Gadgets
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'kitchen-gadgets'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Mixer / Blender", "Juicer", "Toaster", "Kettle", "Food Processor", "Other"]', false, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Personal Care Appliances
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'personal-care-appliances'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Hair Dryer", "Iron", "Trimmer / Clipper", "Massager", "Other"]', false, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Major Appliances
-- ---------------------------------------------------------------------------

-- Refrigerators
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'refrigerators'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["LG", "Samsung", "Whirlpool", "Godrej", "Local Brand", "Other"]', false, 1),
  ('capacity', 'Capacity', 'select', '["<200L", "200-250L", "250-300L", "300-350L", "350L+"]', false, 2),
  ('type', 'Type', 'select', '["Single Door", "Double Door", "French Door", "Side-by-Side"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Washing Machines
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'washing-machines'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["LG", "Samsung", "Bosch", "Godrej", "Haier", "Other"]', false, 1),
  ('capacity', 'Capacity', 'select', '["<5kg", "5-6kg", "6-7kg", "7-8kg", "8kg+"]', false, 2),
  ('type', 'Type', 'select', '["Front Load", "Top Load"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Clothes Dryers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'clothes-dryers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'text', null, false, 1),
  ('capacity', 'Capacity', 'select', '["<5kg", "5-6kg", "6-8kg", "8kg+"]', false, 2),
  ('type', 'Type', 'select', '["Vented", "Condenser", "Heat Pump"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Kitchen Sets (modular kitchens, etc.)
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'kitchen-sets'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('material', 'Material', 'select', '["Stainless Steel", "Modular", "Wood", "Granite", "Other"]', false, 1),
  ('configuration', 'Configuration', 'select', '["Straight", "L-Shape", "U-Shape", "Island"]', false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Built-in Appliances
-- ---------------------------------------------------------------------------

-- Hotplates
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'hotplates'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('burners', 'Number of Burners', 'select', '["2 Burners", "3 Burners", "4 Burners", "5 Burners"]', false, 1),
  ('fuel_type', 'Fuel Type', 'select', '["Gas", "Electric", "Induction"]', false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Built-in Ovens
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'built-in-ovens'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('capacity', 'Capacity', 'select', '["30L", "40L", "50L", "60L+"]', false, 1),
  ('type', 'Type', 'select', '["Microwave", "Convection", "Gas", "Electric"]', false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Built-in Dishwashers
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'built-in-dishwashers'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('capacity', 'Place Settings', 'select', '["12", "13", "14", "15+"]', false, 1),
  ('brand', 'Brand', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Range Hoods
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'range-hoods'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Chimney", "Wall-mounted", "Island", "Under-cabinet"]', false, 1),
  ('suction_power', 'Suction Power', 'select', '["200-400 m³/hr", "400-600 m³/hr", "600m³/hr+"]', false, 2),
  ('brand', 'Brand', 'text', null, false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Photography
-- ---------------------------------------------------------------------------

-- Digital Cameras
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'digital-cameras'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["DSLR", "Mirrorless", "Point & Shoot", "Action Camera", "Bridge Camera"]', true, 1),
  ('brand', 'Brand', 'select', '["Canon", "Nikon", "Sony", "Fujifilm", "GoPro", "Panasonic", "Other"]', false, 2),
  ('megapixels', 'Megapixels', 'select', '["12-16MP", "16-20MP", "20-24MP", "24MP+"]', false, 3),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 4)
) as t(key, label, input_type, options, is_required, sort_order);

-- Camera Lenses
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'camera-lenses'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('mount_type', 'Mount Type', 'select', '["Canon EF", "Canon RF", "Nikon F", "Nikon Z", "Sony E", "Micro 4/3", "Other"]', true, 1),
  ('focal_length', 'Focal Length', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- Photo Accessories
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'photo-accessories'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('type', 'Type', 'select', '["Tripod", "Camera Bag", "Memory Card", "Flash", "Filter", "Lens Cleaner", "Other"]', false, 1),
  ('brand', 'Brand', 'text', null, false, 2)
) as t(key, label, input_type, options, is_required, sort_order);

-- Instant Cameras
insert into public.category_attributes (category_id, key, label, input_type, options, is_required, sort_order)
select (select id from public.categories where slug = 'instant-cameras'), key, label, input_type::public.attribute_input_type, options::jsonb, is_required, sort_order
from (values
  ('brand', 'Brand', 'select', '["Fujifilm Instax", "Polaroid", "Kodak", "Other"]', true, 1),
  ('film_type', 'Film Type', 'text', null, false, 2),
  ('warranty', 'Warranty', 'select', '["No warranty", "Under warranty", "Extended warranty"]', false, 3)
) as t(key, label, input_type, options, is_required, sort_order);

-- ---------------------------------------------------------------------------
-- Favorites / Likes: view for aggregate counts (no RLS restriction)
-- ---------------------------------------------------------------------------

create view public.listing_favorite_counts as
select listing_id, count(*)::int as favorite_count
from public.favorites
group by listing_id;

alter view public.listing_favorite_counts owner to postgres;

grant select on public.listing_favorite_counts to anon, authenticated;
