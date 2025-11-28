-- migrate:up
-- Dodaj kolumnę account_number do tabeli accounts
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS account_number VARCHAR(128);

-- migrate:down
-- Usuń kolumnę account_number
-- ALTER TABLE accounts DROP COLUMN IF EXISTS account_number;
