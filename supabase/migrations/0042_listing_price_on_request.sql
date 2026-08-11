-- Add price_on_request column to listings
-- For advertisement-style listings where no fixed price can be specified
ALTER TABLE listings ADD COLUMN price_on_request BOOLEAN NOT NULL DEFAULT FALSE;

-- No index needed; this is a simple filter alongside seller_id/status in most queries
