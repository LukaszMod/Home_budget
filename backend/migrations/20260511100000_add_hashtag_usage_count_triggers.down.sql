-- Drop triggers
DROP TRIGGER IF EXISTS update_hashtags_on_operation_update ON operations;
DROP TRIGGER IF EXISTS decrement_hashtag_usage_on_operation_delete ON operations;
DROP TRIGGER IF EXISTS increment_hashtag_usage_on_operation_insert ON operations;

-- Drop functions
DROP FUNCTION IF EXISTS handle_operation_update();
DROP FUNCTION IF EXISTS decrement_hashtags_from_description();
DROP FUNCTION IF EXISTS increment_hashtags_from_description();

-- Remove usage_count column (note: operation_hashtags data is permanently lost)
ALTER TABLE hashtags DROP COLUMN usage_count;
