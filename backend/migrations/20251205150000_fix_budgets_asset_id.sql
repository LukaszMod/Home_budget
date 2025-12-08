-- Fix budgets table: rename account_id to asset_id

ALTER TABLE budgets RENAME COLUMN account_id TO asset_id;

-- Update foreign key constraint
ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_account_id_fkey;
ALTER TABLE budgets ADD CONSTRAINT budgets_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;
