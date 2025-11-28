-- migrate:up
-- Użytkownicy
INSERT INTO users (full_name, nick) VALUES
  ('Jan Kowalski', 'jan'),
  ('Anna Nowak', 'anna');

-- Kategorie
INSERT INTO categories (name, main_category) VALUES
  ('Jedzenie', 'Wydatki'),
  ('Zakupy spożywcze', 'Wydatki'),
  ('Restauracje', 'Wydatki'),
  ('Wynagrodzenie', 'Przychody'),
  ('Transport', 'Wydatki');

-- Połącz parent: 'Zakupy spożywcze' jest dzieckiem 'Jedzenie'
UPDATE categories SET parent_id = (SELECT id FROM categories WHERE name = 'Jedzenie') WHERE name = 'Zakupy spożywcze';

-- Konta
INSERT INTO accounts (name, owner) VALUES
  ('Rachunek Jana', (SELECT id FROM users WHERE nick = 'jan')),
  ('Oszczędności Anny', (SELECT id FROM users WHERE nick = 'anna')),
  ('Rachunek Anny', (SELECT id FROM users WHERE nick = 'anna'));

-- Budżety (przykład: miesięczny budżet na zakupy dla Anny)
INSERT INTO budgets (user_id, category_id, month, limit_amount) VALUES
  ((SELECT id FROM users WHERE nick = 'anna'), (SELECT id FROM categories WHERE name = 'Zakupy spożywcze'), '2025-11-01', 500.00),
  ((SELECT id FROM users WHERE nick = 'anna'), (SELECT id FROM categories WHERE name = 'Restauracje'), '2025-11-01', 200.00);

-- Operacje: kilka przychodów i wydatków
INSERT INTO operations (category, description, user_id, account_id, amount, type) VALUES
  ((SELECT id FROM categories WHERE name = 'Wynagrodzenie'), 'Wypłata październik', (SELECT id FROM users WHERE nick = 'anna'), (SELECT id FROM accounts WHERE name = 'Oszczędności Anny'), 3500.00, 'income'),
  ((SELECT id FROM categories WHERE name = 'Zakupy spożywcze'), 'Sklep spożywczy - cotygodniowe zakupy', (SELECT id FROM users WHERE nick = 'anna'), (SELECT id FROM accounts WHERE name = 'Rachunek Anny'), 45.30, 'expense'),
  ((SELECT id FROM categories WHERE name = 'Restauracje'), 'Kolacja w restauracji', (SELECT id FROM users WHERE nick = 'anna'), (SELECT id FROM accounts WHERE name = 'Rachunek Anny'), 30.00, 'expense'),
  ((SELECT id FROM categories WHERE name = 'Transport'), 'Bilet miesięczny', (SELECT id FROM users WHERE nick = 'jan'), (SELECT id FROM accounts WHERE name = 'Rachunek Jana'), 60.00, 'expense');

-- Opcjonalnie: zapis w dzienniku audytu oznaczający seed
INSERT INTO audit_log (user_id, action, table_name, record_id)
VALUES ((SELECT id FROM users WHERE nick = 'anna'), 'seed_insert', 'operations', (SELECT id FROM operations ORDER BY id DESC LIMIT 1));

-- migrate:down
-- Cofnięcie zmian wykonanych w sekcji up (usuwa rekordy dodane przez tego seedu)
-- DELETE FROM audit_log WHERE action = 'seed_insert' AND user_id IN (SELECT id FROM users WHERE nick IN ('jan','anna'));

-- DELETE FROM operations
-- WHERE description IN (
--   'Wypłata październik',
--   'Sklep spożywczy - cotygodniowe zakupy',
--   'Kolacja w restauracji',
--   'Bilet miesięczny'
-- )
-- OR user_id IN (SELECT id FROM users WHERE nick IN ('jan','anna'))
-- OR account_id IN (SELECT id FROM accounts WHERE name IN ('Rachunek Jana','Rachunek Anny','Oszczędności Anny'));

-- DELETE FROM budgets
-- WHERE month = '2025-11-01' AND user_id IN (SELECT id FROM users WHERE nick = 'anna');

-- DELETE FROM accounts WHERE name IN ('Rachunek Jana','Rachunek Anny','Oszczędności Anny');

-- DELETE FROM categories WHERE name IN ('Jedzenie','Zakupy spożywcze','Restauracje','Wynagrodzenie','Transport');

-- DELETE FROM users WHERE nick IN ('jan','anna');
