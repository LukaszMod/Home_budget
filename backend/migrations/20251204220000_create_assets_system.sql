-- Create assets system (replaces accounts)

-- 1. Create asset_types table
CREATE TABLE asset_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('liquid', 'investment', 'property', 'vehicle', 'valuable', 'liability')),
    icon VARCHAR(10),
    allows_operations BOOLEAN DEFAULT false,
    created_date TIMESTAMP DEFAULT NOW()
);

-- 2. Insert predefined asset types
INSERT INTO asset_types (name, category, icon, allows_operations) VALUES
    -- Płynne (allow operations)
    ('Konto bieżące', 'liquid', '💳', true),
    ('Konto oszczędnościowe', 'liquid', '💰', true),
    ('Konto walutowe', 'liquid', '💱', true),
    ('Gotówka', 'liquid', '💵', true),
    
    -- Inwestycje (no operations, buy/sell transactions)
    ('Akcje', 'investment', '📈', false),
    ('Obligacje', 'investment', '📊', false),
    ('Fundusze inwestycyjne', 'investment', '📉', false),
    ('Kryptowaluty', 'investment', '₿', false),
    ('ETF', 'investment', '📊', false),
    
    -- Nieruchomości (valuations only)
    ('Mieszkanie', 'property', '🏠', false),
    ('Dom', 'property', '🏡', false),
    ('Działka', 'property', '🌳', false),
    ('Lokal użytkowy', 'property', '🏢', false),
    
    -- Pojazdy (valuations only)
    ('Samochód', 'vehicle', '🚗', false),
    ('Motocykl', 'vehicle', '🏍️', false),
    
    -- Wartościowe przedmioty (valuations only)
    ('Biżuteria', 'valuable', '💎', false),
    ('Dzieła sztuki', 'valuable', '🖼️', false),
    ('Kolekcje', 'valuable', '🎨', false),
    
    -- Zobowiązania (allow operations)
    ('Kredyt hipoteczny', 'liability', '🏦', true),
    ('Kredyt konsumpcyjny', 'liability', '💳', true),
    ('Pożyczka', 'liability', '💰', true),
    ('Karta kredytowa', 'liability', '💳', true);

-- 3. Create assets table (replaces accounts)
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    asset_type_id INTEGER REFERENCES asset_types(id) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dla aktywów płynnych i zobowiązań
    account_number VARCHAR(50),
    
    -- Dla inwestycji
    quantity DECIMAL(18, 8),
    average_purchase_price DECIMAL(18, 2),
    
    -- Dla nieruchomości/pojazdów/wartościowych
    current_valuation DECIMAL(18, 2),
    
    currency VARCHAR(3) DEFAULT 'PLN',
    is_active BOOLEAN DEFAULT true,
    created_date TIMESTAMP DEFAULT NOW()
);

-- 4. Create investment_transactions table
CREATE TABLE investment_transactions (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'value_increase', 'value_decrease')),
    quantity DECIMAL(18, 8),
    price_per_unit DECIMAL(18, 2),
    total_value DECIMAL(18, 2) NOT NULL,
    transaction_date DATE NOT NULL,
    notes TEXT,
    created_date TIMESTAMP DEFAULT NOW()
);

-- 5. Create asset_valuations table
CREATE TABLE asset_valuations (
    id SERIAL PRIMARY KEY,
    asset_id INTEGER REFERENCES assets(id) ON DELETE CASCADE,
    valuation_date DATE NOT NULL,
    value DECIMAL(18, 2) NOT NULL,
    notes TEXT,
    created_date TIMESTAMP DEFAULT NOW()
);

-- 6. Migrate accounts to assets (as liquid assets - "Konto bieżące")
INSERT INTO assets (id, user_id, asset_type_id, name, account_number, is_active, created_date)
SELECT 
    a.id,
    a.user_id,
    1, -- Default to "Konto bieżące" type
    a.name,
    a.account_number,
    NOT a.is_closed,
    NOW()
FROM accounts a;

-- Update the sequence to continue from the last account id
SELECT setval('assets_id_seq', (SELECT MAX(id) FROM assets));

-- 7. Rename operations.account_id to asset_id
ALTER TABLE operations RENAME COLUMN account_id TO asset_id;

-- 8. Update foreign key constraint
ALTER TABLE operations DROP CONSTRAINT IF EXISTS operations_account_id_fkey;
ALTER TABLE operations ADD CONSTRAINT operations_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

-- 9. Migrate goals table (account_id -> asset_id)
ALTER TABLE goals RENAME COLUMN account_id TO asset_id;
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_account_id_fkey;
ALTER TABLE goals ADD CONSTRAINT goals_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

-- 10. Migrate recurring_operations table (account_id -> asset_id)
ALTER TABLE recurring_operations RENAME COLUMN account_id TO asset_id;
ALTER TABLE recurring_operations DROP CONSTRAINT IF EXISTS recurring_operations_account_id_fkey;
ALTER TABLE recurring_operations ADD CONSTRAINT recurring_operations_asset_id_fkey 
    FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE;

-- 11. Drop old accounts table (hard migration)
DROP TABLE IF EXISTS accounts CASCADE;
