-- Delete operations (they have FK constraints)
DELETE FROM operations 
WHERE account_id IN (SELECT id FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'luca@example.com'));

-- Delete budgets
DELETE FROM budgets 
WHERE account_id IN (SELECT id FROM accounts WHERE user_id IN (SELECT id FROM users WHERE email = 'luca@example.com'));

-- Delete accounts
DELETE FROM accounts 
WHERE user_id IN (SELECT id FROM users WHERE email = 'luca@example.com');

-- Delete users
DELETE FROM users 
WHERE email = 'luca@example.com';

-- Delete seeded categories
DELETE FROM categories 
WHERE name IN ('Rozrywka', 'Kino/teatr', 'Gry/hobby', 'Sport', 
               'Utrzymanie domu', 'Czynsz/hipoteka', 'Opłaty mediów', 'Meble/wyposażenie', 'Sprzątanie/pielęgnacja',
               'Zdrowie', 'Apteka/leki', 'Wizyta u lekarza', 'Dentystyka',
               'Edukacja', 'Kursy/szkolenia', 'Książki', 'Inne wydatki',
               'Kawa/napoje', 'Parkowanie', 'Naprawy pojazdu',
               'Premie/bonusy', 'Dodatkowy dochód', 'Zwroty/refundy');
