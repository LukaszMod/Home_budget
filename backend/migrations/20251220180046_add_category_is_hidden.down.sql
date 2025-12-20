-- Remove index
DROP INDEX IF EXISTS idx_categories_is_hidden;

-- Remove is_hidden column from categories table
ALTER TABLE categories DROP COLUMN is_hidden;
