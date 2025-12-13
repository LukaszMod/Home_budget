-- Revert split operations support

DROP INDEX IF EXISTS idx_operations_parent;

ALTER TABLE operations 
  DROP COLUMN IF EXISTS is_split,
  DROP COLUMN IF EXISTS parent_operation_id;
