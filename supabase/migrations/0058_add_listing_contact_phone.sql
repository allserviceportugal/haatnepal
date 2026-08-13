-- Add optional contact phone number to listings
-- Allows sellers to specify a phone number for each listing independently

ALTER TABLE public.listings ADD COLUMN contact_phone text;

-- Create index for faster lookups
CREATE INDEX idx_listings_contact_phone ON public.listings(contact_phone) WHERE contact_phone IS NOT NULL;
