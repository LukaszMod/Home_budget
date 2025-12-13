-- Add support for split operations
-- Parent operation can be split into multiple child operations

ALTER TABLE operations 
  ADD COLUMN parent_operation_id INT REFERENCES operations(id) ON DELETE CASCADE,
  ADD COLUMN is_split BOOLEAN DEFAULT FALSE;

-- Index for faster queries on children
CREATE INDEX idx_operations_parent ON operations(parent_operation_id);

COMMENT ON COLUMN operations.parent_operation_id IS 'Reference to parent operation if this is a split item';
COMMENT ON COLUMN operations.is_split IS 'True if this operation has been split into children';
