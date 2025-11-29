-- Cofnięcie tworzenia tabel i typu w kolejności bezpiecznej względem zależności
-- Usuwamy najpierw tabele, które zależą od innych, a potem typy
DROP TABLE IF EXISTS audit_log;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS operations;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

-- Usuń typy ENUM jeśli istnieją
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_type') THEN
        DROP TYPE operation_type;
    END IF;
END$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'category_type') THEN
        DROP TYPE category_type;
    END IF;
END$$;
