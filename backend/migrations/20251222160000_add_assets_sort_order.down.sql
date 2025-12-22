-- Remove sort_order column from assets
DROP INDEX IF EXISTS idx_assets_sort_order;
ALTER TABLE assets DROP COLUMN IF EXISTS sort_order;
