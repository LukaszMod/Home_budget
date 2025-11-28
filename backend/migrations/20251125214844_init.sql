-- migrate:up
-- users
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    nick VARCHAR(100) UNIQUE NOT NULL,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    main_category VARCHAR(255),
    parent_id INT REFERENCES categories(id) ON DELETE SET NULL
);

-- accounts
CREATE TABLE IF NOT EXISTS accounts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner INT NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- operation type
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_type') THEN
        CREATE TYPE operation_type AS ENUM ('income', 'expense');
    END IF;
END$$;

-- operations
CREATE TABLE IF NOT EXISTS operations (
    id SERIAL PRIMARY KEY,
    creation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category INT REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    parent_operation INT REFERENCES operations(id) ON DELETE CASCADE,
    account_id INT REFERENCES accounts(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    type operation_type NOT NULL
);

-- budgets
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    limit_amount NUMERIC(12,2) NOT NULL
);

-- audit_log (opcjonalnie)
CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INT NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- migrate:down
-- Cofnięcie tworzenia tabel i typu w kolejności bezpiecznej względem zależności
-- Usuwamy najpierw tabele, które zależą od innych, a potem typy
-- DROP TABLE IF EXISTS audit_log;
-- DROP TABLE IF EXISTS budgets;
-- DROP TABLE IF EXISTS operations;
-- DROP TABLE IF EXISTS accounts;
-- DROP TABLE IF EXISTS categories;
-- DROP TABLE IF EXISTS users;

-- -- Usuń typ ENUM jeśli istnieje
-- DO $$
-- BEGIN
--     IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_type') THEN
--         DROP TYPE operation_type;
--     END IF;
-- END$$;
