-- migrate:up
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT FALSE;

-- Mark existing categories as non-system
UPDATE categories SET is_system = FALSE WHERE is_system IS NULL;

-- migrate:down
ALTER TABLE categories DROP COLUMN IF EXISTS is_system;
