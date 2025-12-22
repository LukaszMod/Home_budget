-- migrate:down
DROP TRIGGER IF EXISTS trigger_delete_linked_transfer ON operations;
DROP FUNCTION IF EXISTS delete_linked_transfer();
DROP FUNCTION IF EXISTS create_linked_transfer(INT, INT, NUMERIC, DATE, TEXT);
DROP FUNCTION IF EXISTS classify_uncategorized_as_transfers();

-- Remove system transfer categories
DELETE FROM categories WHERE name IN ('Outgoing', 'Incoming') 
    AND parent_id IN (SELECT id FROM categories WHERE name = 'Transfer' AND is_system = TRUE);
DELETE FROM categories WHERE name = 'Transfer' AND parent_id IS NULL AND is_system = TRUE;

-- Remove linked_operation_id column
ALTER TABLE operations DROP COLUMN IF EXISTS linked_operation_id;
