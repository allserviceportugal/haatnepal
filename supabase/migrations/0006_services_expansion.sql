-- haatnepal: expand Services subcategories (explicitly requested + a few
-- other common Nepal service categories)

insert into public.categories (parent_id, name, slug)
select (select id from public.categories where slug = 'services'), name, slug
from (values
  ('Legal Services', 'legal-services'),
  ('Consulting Services', 'consulting-services'),
  ('Tickets & Booking Services', 'tickets-booking-services'),
  ('Foreign Employment Services', 'foreign-employment-services'),
  ('Study Abroad Services', 'study-abroad-services'),
  ('Visa & Immigration Services', 'visa-immigration-services'),
  ('Financial & Insurance Services', 'financial-insurance-services'),
  ('Photography & Videography Services', 'photography-videography-services'),
  ('Printing & Design Services', 'printing-design-services'),
  ('Moving & Relocation Services', 'moving-relocation-services')
) as t(name, slug);
