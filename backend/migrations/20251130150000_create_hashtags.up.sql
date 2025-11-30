-- Create hashtags table
CREATE TABLE hashtags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for operations and hashtags
CREATE TABLE operation_hashtags (
  operation_id INTEGER NOT NULL REFERENCES operations(id) ON DELETE CASCADE,
  hashtag_id INTEGER NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  PRIMARY KEY (operation_id, hashtag_id)
);

-- Index for faster hashtag lookups
CREATE INDEX idx_hashtag_name ON hashtags(name);
CREATE INDEX idx_operation_hashtags_hashtag ON operation_hashtags(hashtag_id);
