-- Add the 'archived' listing status.
--
-- Migration 0047 tried to add several statuses but never applied: its
-- `select cron.schedule(...) on conflict ...` is invalid SQL after a SELECT, so
-- the whole file failed. The live enum is still (draft, active, sold, expired,
-- removed) and none of 0047's functions or audit columns exist.
--
-- ALTER TYPE ... ADD VALUE cannot be used in the same transaction that adds it,
-- so this is deliberately its own migration; 0069 does the work that uses it.

ALTER TYPE public.listing_status ADD VALUE IF NOT EXISTS 'archived' AFTER 'expired';
