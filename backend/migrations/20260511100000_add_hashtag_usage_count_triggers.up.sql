-- Add usage_count column to hashtags table
ALTER TABLE hashtags ADD COLUMN usage_count INTEGER DEFAULT 0;

-- Update usage_count based on existing operation_hashtags relationships
UPDATE hashtags SET usage_count = (
  SELECT COUNT(*) FROM operation_hashtags WHERE hashtag_id = hashtags.id
) WHERE id IN (
  SELECT DISTINCT hashtag_id FROM operation_hashtags
);

-- Drop the operation_hashtags table (no longer needed)
DROP TABLE operation_hashtags;

-- Function to extract hashtags from text and increment their usage_count
CREATE OR REPLACE FUNCTION increment_hashtags_from_description()
RETURNS TRIGGER AS $$
DECLARE
  word TEXT;
  hashtag TEXT;
BEGIN
  -- Only process if description is not null
  IF NEW.description IS NOT NULL THEN
    -- Split by spaces and process each word
    FOR word IN SELECT unnest(string_to_array(NEW.description, ' ')) LOOP
      -- Check if word starts with # and extract alphanumeric + underscore
      IF word LIKE '#%' THEN
        hashtag := lower(
          regexp_replace(substr(word, 2), '[^a-zA-Z0-9_]', '', 'g')
        );
        -- Only insert/update if hashtag is not empty
        IF hashtag != '' THEN
          INSERT INTO hashtags (name, usage_count) VALUES (hashtag, 1)
          ON CONFLICT (name) DO UPDATE SET usage_count = hashtags.usage_count + 1;
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to extract hashtags from text and decrement their usage_count
CREATE OR REPLACE FUNCTION decrement_hashtags_from_description()
RETURNS TRIGGER AS $$
DECLARE
  word TEXT;
  hashtag TEXT;
BEGIN
  -- Only process if description is not null
  IF OLD.description IS NOT NULL THEN
    -- Split by spaces and process each word
    FOR word IN SELECT unnest(string_to_array(OLD.description, ' ')) LOOP
      -- Check if word starts with # and extract alphanumeric + underscore
      IF word LIKE '#%' THEN
        hashtag := lower(
          regexp_replace(substr(word, 2), '[^a-zA-Z0-9_]', '', 'g')
        );
        -- Only update if hashtag is not empty
        IF hashtag != '' THEN
          UPDATE hashtags SET usage_count = usage_count - 1 WHERE name = hashtag;
        END IF;
      END IF;
    END LOOP;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Function to handle UPDATE on operations - update hashtag usage_count
CREATE OR REPLACE FUNCTION handle_operation_update()
RETURNS TRIGGER AS $$
DECLARE
  old_word TEXT;
  new_word TEXT;
  old_hashtag TEXT;
  new_hashtag TEXT;
BEGIN
  -- If description changed, update hashtags
  IF OLD.description IS DISTINCT FROM NEW.description THEN
    -- Extract hashtags from old description and decrement
    IF OLD.description IS NOT NULL THEN
      FOR old_word IN SELECT unnest(string_to_array(OLD.description, ' ')) LOOP
        IF old_word LIKE '#%' THEN
          old_hashtag := lower(regexp_replace(substr(old_word, 2), '[^a-zA-Z0-9_]', '', 'g'));
          IF old_hashtag != '' THEN
            UPDATE hashtags SET usage_count = usage_count - 1 WHERE name = old_hashtag;
          END IF;
        END IF;
      END LOOP;
    END IF;

    -- Extract hashtags from new description and increment
    IF NEW.description IS NOT NULL THEN
      FOR new_word IN SELECT unnest(string_to_array(NEW.description, ' ')) LOOP
        IF new_word LIKE '#%' THEN
          new_hashtag := lower(regexp_replace(substr(new_word, 2), '[^a-zA-Z0-9_]', '', 'g'));
          IF new_hashtag != '' THEN
            INSERT INTO hashtags (name, usage_count) VALUES (new_hashtag, 1)
            ON CONFLICT (name) DO UPDATE SET usage_count = hashtags.usage_count + 1;
          END IF;
        END IF;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to increment hashtag usage_count when operation is created
CREATE TRIGGER increment_hashtag_usage_on_operation_insert
AFTER INSERT ON operations
FOR EACH ROW
EXECUTE FUNCTION increment_hashtags_from_description();

-- Trigger to decrement hashtag usage_count when operation is deleted
CREATE TRIGGER decrement_hashtag_usage_on_operation_delete
AFTER DELETE ON operations
FOR EACH ROW
EXECUTE FUNCTION decrement_hashtags_from_description();

-- Trigger to update hashtag usage_count when operation description is updated
CREATE TRIGGER update_hashtags_on_operation_update
AFTER UPDATE ON operations
FOR EACH ROW
EXECUTE FUNCTION handle_operation_update();
