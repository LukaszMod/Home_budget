# Syntax Checkers

Narzędzia do sprawdzania poprawności składni plików projektu.

## Dostępne narzędzia

### check_braces.cjs
Sprawdza czy wszystkie nawiasy klamrowe `{` i `}` są prawidłowo zbalansowane w pliku.

**Użycie:**
```bash
cd tools/syntax_checkers
node check_braces.cjs
```

**Output:**
- `All braces matched!` - wszystkie nawiasy są poprawnie zbalansowane
- `ERROR: Missing X closing braces` - brakuje X zamykających nawiastów
- `ERROR: Extra closing brace at line X` - nadmiarowy nawias zamykający w linii X

### check_depth.cjs
Sprawdza głębokość zagnieżdżenia nawiastów klamrowych i pokazuje końcową głębokość.

**Użycie:**
```bash
cd tools/syntax_checkers
node check_depth.cjs
```

**Output:**
- `Final depth: X` - końcowa głębokość (powinna być 0)
- `Minimum depth: X at line Y` - minimalna głębokość osiągnięta w linii Y

### check_all.cjs
Pokazuje szczegółowy przebieg zagnieżdżenia dla ostatnich 50 linii pliku oraz przy słowach kluczowych.

**Użycie:**
```bash
cd tools/syntax_checkers
node check_all.cjs
```

**Output:**
Dla każdej linii pokazuje:
- Numer linii
- Aktualną głębokość zagnieżdżenia
- Fragment kodu

## Uwagi

Wszystkie skrypty są skonfigurowane do sprawdzania pliku:
```
frontend/src/i18n.ts
```

Aby sprawdzić inny plik, edytuj linię:
```javascript
const content = fs.readFileSync('src/i18n.ts', 'utf8');
```

na odpowiednią ścieżkę względem katalogu `tools/syntax_checkers/`.
