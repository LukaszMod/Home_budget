-- Dodaj kolumny full_name i nick do tabeli users
ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS nick VARCHAR(255);

-- Aktualizuj istniejące użytkowniki
UPDATE users SET full_name = SPLIT_PART(email, '@', 1), nick = SPLIT_PART(email, '@', 1) WHERE full_name IS NULL;

-- Uczyń kolumny obowiązkowe
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;
ALTER TABLE users ALTER COLUMN nick SET NOT NULL;
