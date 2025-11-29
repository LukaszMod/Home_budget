-- migrate:up
-- Użytkownicy
INSERT INTO users (email, password_hash) VALUES
  ('jan@example.com', 'hashed_password_123'),
  ('anna@example.com', 'hashed_password_123');

-- Kategorie główne (wydatki)
INSERT INTO categories (name, parent_id, type) VALUES
  ('Jedzenie', NULL, 'expense'),
  ('Transport', NULL, 'expense');

-- Subkategorie pod Jedzeniem
INSERT INTO categories (name, parent_id, type) VALUES
  ('Zakupy spożywcze', (SELECT id FROM categories WHERE name = 'Jedzenie' AND parent_id IS NULL), 'expense'),
  ('Restauracje', (SELECT id FROM categories WHERE name = 'Jedzenie' AND parent_id IS NULL), 'expense');

-- Kategoria główna (przychody)
INSERT INTO categories (name, parent_id, type) VALUES
  ('Przychody', NULL, 'income');

-- Subkategoria pod Przychodami
INSERT INTO categories (name, parent_id, type) VALUES
  ('Wynagrodzenie', (SELECT id FROM categories WHERE name = 'Przychody' AND parent_id IS NULL), 'income');

-- Konta
INSERT INTO accounts (user_id, name, account_number) VALUES
  ((SELECT id FROM users WHERE email = 'jan@example.com'), 'Rachunek Jana', 'PL61109010140000071219812870'),
  ((SELECT id FROM users WHERE email = 'anna@example.com'), 'Oszczędności Anny', 'PL61109010140000071219812871'),
  ((SELECT id FROM users WHERE email = 'anna@example.com'), 'Rachunek Anny', 'PL61109010140000071219812872');

-- Budżety (tylko na subkategoriach)
INSERT INTO budgets (account_id, category_id, month, planned_amount) VALUES
  ((SELECT id FROM accounts WHERE name = 'Rachunek Anny'), (SELECT id FROM categories WHERE name = 'Zakupy spożywcze'), '2025-11-01', 500.00),
  ((SELECT id FROM accounts WHERE name = 'Rachunek Anny'), (SELECT id FROM categories WHERE name = 'Restauracje'), '2025-11-01', 200.00);

-- Operacje: kilka przychodów i wydatków (używamy subkategorii)
INSERT INTO operations (category_id, description, account_id, amount, operation_type, operation_date) VALUES
  ((SELECT id FROM categories WHERE name = 'Wynagrodzenie'), 'Wypłata październik', (SELECT id FROM accounts WHERE name = 'Oszczędności Anny'), 3500.00, 'income'::operation_type, '2025-11-01'),
  ((SELECT id FROM categories WHERE name = 'Zakupy spożywcze'), 'Sklep spożywczy - cotygodniowe zakupy', (SELECT id FROM accounts WHERE name = 'Rachunek Anny'), 45.30, 'expense'::operation_type, '2025-11-05'),
  ((SELECT id FROM categories WHERE name = 'Restauracje'), 'Kolacja w restauracji', (SELECT id FROM accounts WHERE name = 'Rachunek Anny'), 30.00, 'expense'::operation_type, '2025-11-10');

-- Transport - subkategoria
INSERT INTO categories (name, parent_id, type) VALUES
  ('Bilet komunikacji', (SELECT id FROM categories WHERE name = 'Transport' AND parent_id IS NULL), 'expense');

INSERT INTO operations (category_id, description, account_id, amount, operation_type, operation_date) VALUES
  ((SELECT id FROM categories WHERE name = 'Bilet komunikacji'), 'Bilet miesięczny', (SELECT id FROM accounts WHERE name = 'Rachunek Jana'), 60.00, 'expense'::operation_type, '2025-11-15');


