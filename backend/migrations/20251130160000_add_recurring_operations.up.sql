-- Add recurring operation type enum
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurring_frequency') THEN
        CREATE TYPE recurring_frequency AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly');
    END IF;
END$$;

-- Create recurring_operations table
CREATE TABLE IF NOT EXISTS recurring_operations (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    amount NUMERIC(12,2) NOT NULL,
    operation_type operation_type NOT NULL,
    frequency recurring_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_generated DATE
);

-- Add index for recurring operations queries
CREATE INDEX IF NOT EXISTS idx_recurring_operations_account_id ON recurring_operations(account_id);
CREATE INDEX IF NOT EXISTS idx_recurring_operations_is_active ON recurring_operations(is_active);
