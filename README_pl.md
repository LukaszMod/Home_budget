# Home Budget — Instrukcja uruchomienia (Polski)

To repozytorium zawiera prostą aplikację do zarządzania budżetem domowym: backend napisany w Rust (axum + sqlx + Postgres) oraz frontend w TypeScript/React (Vite + MUI).

Poniżej opis krok po kroku jak postawić środowisko lokalnie (backend i frontend).

Wymagania wstępne
- Rust (rustup + cargo)
- PostgreSQL (lokalny lub zdalny dostęp)
- Node.js 18+ i npm (można też użyć pnpm/yarn)
- Opcjonalnie: `sqlx-cli` do uruchamiania migracji (zalecane)

Szybkie uruchomienie — backend

1. Przygotuj bazę danych

   Upewnij się, że PostgreSQL działa i utwórz bazę wymienioną w `backend/.env` (domyślnie `home_budget`).

   Przykład (użytkownik `postgres` ma uprawnienia do tworzenia baz):

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE home_budget;"
   ```

2. Zainstaluj sqlx-cli (opcjonalne)

   ```bash
   cargo install sqlx-cli --no-default-features --features postgres,rustls
   ```

3. Uruchom migracje

   Załaduj zmienne z `.env` i uruchom migracje w katalogu `backend`:

   ```bash
   cd backend
   export $(grep -v '^#' .env | xargs)
   sqlx migrate run
   ```

   Jeżeli nie masz `sqlx-cli`, możesz ręcznie wykonać pliki SQL przy pomocy `psql`.

4. Uruchom backend

   ```bash
   # tryb deweloperski
   cargo run

   # lub produkcyjny
   cargo run --release
   ```

   Serwer nasłuchuje na `127.0.0.1:3000` (sprawdź `backend/src/main.rs`).

5. Sprawdź endpoint

   ```bash
   curl -sS http://127.0.0.1:3000/accounts | jq
   ```

Szybkie uruchomienie — frontend

1. Instalacja zależności

   ```bash
   cd frontend
   npm install
   ```

2. Uruchomienie dev servera

   Frontend oczekuje backendu pod adresem ustawionym w `VITE_BACKEND_URL` lub domyślnie `http://localhost:3000`.

   ```bash
   npm run dev
   ```

3. Build produkcyjny

   ```bash
   npm run build
   npm run preview
   ```

Zmienne środowiskowe
- `backend/.env` — `DATABASE_URL` (connection string do Postgresa) i `RUST_LOG`.
- `frontend` może używać `VITE_BACKEND_URL` przy buildzie/uruchomieniu.

Najczęstsze problemy
- Migracje wydają się aplikowane, ale nie widzisz zmian — upewnij się, że przed `sqlx migrate run` załadowałeś te same zmienne środowiskowe (`export $(grep -v '^#' backend/.env | xargs)`).
- Port 3000 zajęty — zmień nasłuchiwanie w `backend/src/main.rs` i przebuduj.
- Błędy builda frontendu związane z MUI — sprawdź wersję Node i czy pakiety MUI są zainstalowane.

Najważniejsze komendy

```bash
# Załaduj env i uruchom migracje
cd backend
export $(grep -v '^#' .env | xargs)
sqlx migrate run

# Uruchom backend
cargo run

# Uruchom frontend (dev)
cd frontend
npm install
npm run dev

# Build frontendu
npm run build
```

Uwagi końcowe
- Projekt jest przykładowy. Dostosuj poświadczenia i konfigurację do środowiska produkcyjnego.
