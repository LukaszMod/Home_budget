-- Revert budgets table: rename asset_id back to account_id

ALTER TABLE budgets DROP CONSTRAINT IF EXISTS budgets_asset_id_fkey;
ALTER TABLE budgets RENAME COLUMN asset_id TO account_id;
ALTER TABLE budgets ADD CONSTRAINT budgets_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES assets(id) ON DELETE CASCADE;
