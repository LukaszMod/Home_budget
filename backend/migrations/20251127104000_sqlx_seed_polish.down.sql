DELETE FROM operations
WHERE description IN (
  'Wypłata październik',
  'Sklep spożywczy - cotygodniowe zakupy',
  'Kolacja w restauracji',
  'Bilet miesięczny'
);

DELETE FROM budgets
WHERE month = '2025-11-01' AND account_id IN (SELECT id FROM accounts WHERE name IN ('Rachunek Anny', 'Rachunek Jana', 'Oszczędności Anny'));

DELETE FROM accounts WHERE name IN ('Rachunek Jana','Rachunek Anny','Oszczędności Anny');

DELETE FROM categories WHERE name IN ('Jedzenie','Zakupy spożywcze','Restauracje','Transport','Bilet komunikacji','Przychody','Wynagrodzenie');

DELETE FROM users WHERE email IN ('jan@example.com','anna@example.com');
