-- Add sort_order column to assets table
ALTER TABLE assets ADD COLUMN sort_order INTEGER;

-- Initialize sort_order based on current id order
UPDATE assets SET sort_order = id;

-- Set NOT NULL constraint after initialization
ALTER TABLE assets ALTER COLUMN sort_order SET NOT NULL;

-- Add index for better performance
CREATE INDEX idx_assets_sort_order ON assets(sort_order);
