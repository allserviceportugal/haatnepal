-- Contact details must only be visible to signed-in users (OLX-style).
--
-- Before this, anyone holding the public anon key - which is embedded in the
-- site's own JavaScript - could read every user's email and phone straight from
-- the REST API:
--
--   GET /rest/v1/profiles?select=display_name,email,phone
--   GET /rest/v1/listings?select=contact_phone
--
-- The UI already said "Login to view contact", but that was cosmetic: the data
-- was public, and listings.contact_phone was additionally rendered into the
-- anonymous page HTML.
--
-- Postgres cannot mask columns through RLS, so this is enforced with column
-- privileges. Row visibility is unchanged - anonymous visitors still browse
-- listings and profiles, they just cannot select the contact columns.
--
-- NOTE: because of this, any `select *` against these tables as an anonymous
-- user now fails. LISTING_SELECT and the public profile page were changed to
-- explicit column lists in the same commit. New contact-ish columns must be
-- revoked here too.

-- IMPORTANT: anon holds a TABLE-level SELECT grant, which implies every column,
-- so a column-level REVOKE is a no-op against it. (This is why the REVOKEs in
-- migration 0057 had no effect and contact details stayed public.) The table
-- grant has to be dropped first, then re-granted column by column.

REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (
  id, display_name, phone_verified, avatar_url, district, city, rating_avg,
  rating_count, created_at, account_type, subscription_plan_id, business_description,
  logo_url, cover_image_url, province, password_set, email_confirmed, role
) ON public.profiles TO anon;

REVOKE SELECT ON public.listings FROM anon;
GRANT SELECT (
  id, seller_id, category_id, title, description, price, currency, condition,
  listing_type, status, district, city, created_at, updated_at, expires_at,
  pickup_available, featured_at, featured_until, province, municipality, ward_number,
  tole, land_unit_system, land_ropani, land_aana, land_paisa, land_daam, land_bigha,
  land_kattha, land_dhur, land_area_sqft, listing_number, view_count, bluebook_status,
  registration_year, manufacturing_year, import_status, owner_count, is_modified,
  accident_history, service_history, food_freshness, best_before_date, manufacturing_date,
  ingredients, storage_instructions, allergen_info, is_food, is_agriculture, harvest_date,
  unit_of_sale, min_order_quantity, farm_location, for_rent, rental_rate_period,
  price_on_request, transaction_mode, allow_offers, allow_checkout, allow_contact,
  allow_messaging, company_name, salary_min, salary_max, salary_period, salary_negotiable,
  vacancies_count, application_deadline, external_apply_url
) ON public.listings TO anon;

-- Signed-in users keep full access.
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT ON public.listings TO authenticated;
