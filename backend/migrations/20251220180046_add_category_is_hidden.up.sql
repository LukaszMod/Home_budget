-- Add is_hidden column to categories table
ALTER TABLE categories ADD COLUMN is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX idx_categories_is_hidden ON categories(is_hidden);
