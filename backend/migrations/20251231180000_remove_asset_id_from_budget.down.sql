ALTER TABLE budgets ADD COLUMN asset_id INTEGER;

-- Update foreign key constraint
ALTER TABLE budgets ADD CONSTRAINT budgets_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;
