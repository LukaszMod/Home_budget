-- Usuń kolumny full_name i nick z tabeli users
ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
ALTER TABLE users ALTER COLUMN nick DROP NOT NULL;

ALTER TABLE users DROP COLUMN IF EXISTS nick;
ALTER TABLE users DROP COLUMN IF EXISTS full_name;
