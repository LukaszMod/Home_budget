-- Rollback assets system migration

-- 1. Recreate accounts table
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    account_number VARCHAR(50),
    is_closed BOOLEAN DEFAULT false
);

-- 2. Migrate liquid assets back to accounts
INSERT INTO accounts (id, user_id, name, account_number, is_closed)
SELECT 
    a.id,
    a.user_id,
    a.name,
    a.account_number,
    NOT a.is_active
FROM assets a
INNER JOIN asset_types at ON a.asset_type_id = at.id
WHERE at.category = 'liquid';

-- Update sequence
SELECT setval('accounts_id_seq', (SELECT MAX(id) FROM accounts));

-- 3. Rename operations.asset_id back to account_id
ALTER TABLE operations RENAME COLUMN asset_id TO account_id;
ALTER TABLE operations DROP CONSTRAINT IF EXISTS operations_asset_id_fkey;
ALTER TABLE operations ADD CONSTRAINT operations_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- 4. Rollback goals
ALTER TABLE goals RENAME COLUMN asset_id TO account_id;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_asset_id_fkey;
ALTER TABLE goals ADD CONSTRAINT goals_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- 5. Rollback recurring_operations
ALTER TABLE recurring_operations RENAME COLUMN asset_id TO account_id;
ALTER TABLE recurring_operations DROP CONSTRAINT IF EXISTS recurring_operations_asset_id_fkey;
ALTER TABLE recurring_operations ADD CONSTRAINT recurring_operations_account_id_fkey 
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE;

-- 6. Drop new tables
DROP TABLE IF EXISTS asset_valuations;
DROP TABLE IF EXISTS investment_transactions;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS asset_types;
