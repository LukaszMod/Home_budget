-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount NUMERIC(12,2) NOT NULL,
    current_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    target_date DATE NOT NULL,
    created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_date TIMESTAMP,
    is_completed BOOLEAN DEFAULT FALSE,
    CONSTRAINT target_date_future CHECK (target_date > created_date::date)
);

-- Create index on user_id for faster queries
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_account_id ON goals(account_id);
