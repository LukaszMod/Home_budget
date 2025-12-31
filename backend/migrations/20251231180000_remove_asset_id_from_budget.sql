
ALTER TABLE budgets DROP COLUMN IF EXISTS asset_id;

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_asset_id_fkey;