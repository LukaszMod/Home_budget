-- Add sort_order column to categories table
ALTER TABLE categories ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- Initialize sort_order based on id to maintain current order
WITH sorted AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY id) as rn
    FROM categories
)
UPDATE categories c
SET sort_order = s.rn
FROM sorted s
WHERE c.id = s.id;
