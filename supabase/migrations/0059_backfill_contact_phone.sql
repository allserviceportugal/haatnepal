-- Backfill contact_phone from seller profiles for existing listings
UPDATE public.listings
SET contact_phone = p.phone
FROM public.profiles p
WHERE listings.seller_id = p.id
AND listings.contact_phone IS NULL
AND p.phone IS NOT NULL;
