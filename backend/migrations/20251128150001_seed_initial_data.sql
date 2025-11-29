-- migrate:up
-- Ensure we have a Rozrywka category
INSERT INTO categories (name, parent_id, type) 
SELECT 'Rozrywka', NULL, 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Rozrywka' AND parent_id IS NULL);

-- Add subcategories for Rozrywka
INSERT INTO categories (name, parent_id, type) 
SELECT 'Kino/teatr', (SELECT id FROM categories WHERE name = 'Rozrywka' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Kino/teatr');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Gry/hobby', (SELECT id FROM categories WHERE name = 'Rozrywka' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Gry/hobby');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Sport', (SELECT id FROM categories WHERE name = 'Rozrywka' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sport');

-- Ensure we have Utrzymanie domu category
INSERT INTO categories (name, parent_id, type) 
SELECT 'Utrzymanie domu', NULL, 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Utrzymanie domu' AND parent_id IS NULL);

-- Add subcategories for Utrzymanie domu
INSERT INTO categories (name, parent_id, type) 
SELECT 'Czynsz/hipoteka', (SELECT id FROM categories WHERE name = 'Utrzymanie domu' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Czynsz/hipoteka');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Opłaty mediów', (SELECT id FROM categories WHERE name = 'Utrzymanie domu' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Opłaty mediów');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Meble/wyposażenie', (SELECT id FROM categories WHERE name = 'Utrzymanie domu' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Meble/wyposażenie');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Sprzątanie/pielęgnacja', (SELECT id FROM categories WHERE name = 'Utrzymanie domu' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Sprzątanie/pielęgnacja');

-- Ensure we have Zdrowie category
INSERT INTO categories (name, parent_id, type) 
SELECT 'Zdrowie', NULL, 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Zdrowie' AND parent_id IS NULL);

-- Add subcategories for Zdrowie
INSERT INTO categories (name, parent_id, type) 
SELECT 'Apteka/leki', (SELECT id FROM categories WHERE name = 'Zdrowie' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Apteka/leki');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Wizyta u lekarza', (SELECT id FROM categories WHERE name = 'Zdrowie' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Wizyta u lekarza');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Dentystyka', (SELECT id FROM categories WHERE name = 'Zdrowie' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dentystyka');

-- Ensure we have Edukacja category
INSERT INTO categories (name, parent_id, type) 
SELECT 'Edukacja', NULL, 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Edukacja' AND parent_id IS NULL);

-- Add subcategories for Edukacja
INSERT INTO categories (name, parent_id, type) 
SELECT 'Kursy/szkolenia', (SELECT id FROM categories WHERE name = 'Edukacja' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Kursy/szkolenia');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Książki', (SELECT id FROM categories WHERE name = 'Edukacja' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Książki');

-- Ensure we have Inne wydatki category
INSERT INTO categories (name, parent_id, type) 
SELECT 'Inne wydatki', NULL, 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Inne wydatki' AND parent_id IS NULL);

-- Add Kawa/napoje under Jedzenie if it doesn't exist
INSERT INTO categories (name, parent_id, type) 
SELECT 'Kawa/napoje', (SELECT id FROM categories WHERE name = 'Jedzenie' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Kawa/napoje');

-- Add subcategories for Transport if they don't exist
INSERT INTO categories (name, parent_id, type) 
SELECT 'Parkowanie', (SELECT id FROM categories WHERE name = 'Transport' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Parkowanie');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Naprawy pojazdu', (SELECT id FROM categories WHERE name = 'Transport' AND parent_id IS NULL), 'expense'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Naprawy pojazdu');

-- Add Income-related categories
INSERT INTO categories (name, parent_id, type) 
SELECT 'Premie/bonusy', (SELECT id FROM categories WHERE name = 'Przychody' AND parent_id IS NULL), 'income'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Premie/bonusy');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Dodatkowy dochód', (SELECT id FROM categories WHERE name = 'Przychody' AND parent_id IS NULL), 'income'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Dodatkowy dochód');

INSERT INTO categories (name, parent_id, type) 
SELECT 'Zwroty/refundy', (SELECT id FROM categories WHERE name = 'Przychody' AND parent_id IS NULL), 'income'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Zwroty/refundy');

-- Insert initial users
INSERT INTO users (email, password_hash) VALUES 
('luca@example.com', 'hashed_password_123')
ON CONFLICT (email) DO NOTHING;

-- Insert initial accounts
INSERT INTO accounts (user_id, name, account_number) 
SELECT id, 'Konto osobiste', 'PL61109010140000071219812874' FROM users WHERE email = 'luca@example.com'
ON CONFLICT DO NOTHING;

INSERT INTO accounts (user_id, name, account_number) 
SELECT id, 'Rachunek oszczędzania', 'PL61109010140000071219812875' FROM users WHERE email = 'luca@example.com'
ON CONFLICT DO NOTHING;

-- Insert initial budgets for current month (January 2025 - adjust as needed)
INSERT INTO budgets (account_id, category_id, month, planned_amount)
SELECT 
    a.id,
    c.id,
    '2025-01-01'::date,
    CASE 
        WHEN c.name = 'Jedzenie' THEN 1000
        WHEN c.name = 'Transport' THEN 500
        WHEN c.name = 'Rozrywka' THEN 300
        WHEN c.name = 'Utrzymanie domu' THEN 2000
        WHEN c.name = 'Zdrowie' THEN 200
        WHEN c.name = 'Edukacja' THEN 150
        WHEN c.name = 'Inne wydatki' THEN 100
        WHEN c.name = 'Wynagrodzenie' THEN 5000
        ELSE 0
    END
FROM accounts a
CROSS JOIN categories c
WHERE a.user_id = (SELECT id FROM users WHERE email = 'luca@example.com')
AND c.parent_id IS NOT NULL
AND c.type IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM budgets 
    WHERE budgets.account_id = a.id 
    AND budgets.category_id = c.id 
    AND budgets.month = '2025-01-01'::date
);

-- Insert some sample operations for demonstration
INSERT INTO operations (account_id, category_id, amount, description, operation_type, operation_date)
SELECT 
    a.id,
    c.id,
    CASE 
        WHEN c.name = 'Wynagrodzenie' THEN 5000
        WHEN c.name = 'Chleb' THEN -45.50
        WHEN c.name = 'Warzywa' THEN -32.00
        WHEN c.name = 'Mleko' THEN -8.50
        WHEN c.name = 'Benzyna' THEN -150
        WHEN c.name = 'Film' THEN -30
        WHEN c.name = 'Książki' THEN -45
        ELSE 0
    END,
    CASE 
        WHEN c.name = 'Wynagrodzenie' THEN 'Pensja za styczeń'
        WHEN c.name = 'Chleb' THEN 'Zakup piekarni'
        WHEN c.name = 'Warzywa' THEN 'Zakup warzyw na rynku'
        WHEN c.name = 'Mleko' THEN 'Mleko ze sklepu'
        WHEN c.name = 'Benzyna' THEN 'Tankowanie'
        WHEN c.name = 'Film' THEN 'Bilet do kina'
        WHEN c.name = 'Książki' THEN 'Zakup książek'
        ELSE ''
    END,
    CASE 
        WHEN c.name = 'Wynagrodzenie' THEN 'income'::operation_type
        ELSE 'expense'::operation_type
    END,
    CASE 
        WHEN c.name = 'Wynagrodzenie' THEN '2025-01-05'::date
        WHEN c.name = 'Chleb' THEN '2025-01-08'::date
        WHEN c.name = 'Warzywa' THEN '2025-01-08'::date
        WHEN c.name = 'Mleko' THEN '2025-01-10'::date
        WHEN c.name = 'Benzyna' THEN '2025-01-07'::date
        WHEN c.name = 'Film' THEN '2025-01-12'::date
        WHEN c.name = 'Książki' THEN '2025-01-15'::date
        ELSE CURRENT_DATE
    END
FROM accounts a
CROSS JOIN categories c
WHERE a.user_id = (SELECT id FROM users WHERE email = 'luca@example.com')
AND c.name IN ('Wynagrodzenie', 'Chleb', 'Warzywa', 'Mleko', 'Benzyna', 'Film', 'Książki')
AND NOT EXISTS (
    SELECT 1 FROM operations 
    WHERE operations.account_id = a.id 
    AND operations.category_id = c.id 
    AND operations.description LIKE CASE 
        WHEN c.name = 'Wynagrodzenie' THEN 'Pensja%'
        WHEN c.name = 'Chleb' THEN 'Zakup piekarni%'
        WHEN c.name = 'Warzywa' THEN 'Zakup warzyw%'
        WHEN c.name = 'Mleko' THEN 'Mleko%'
        WHEN c.name = 'Benzyna' THEN 'Tankowanie%'
        WHEN c.name = 'Film' THEN 'Bilet%'
        WHEN c.name = 'Książki' THEN 'Zakup książek%'
        ELSE ''
    END
);

