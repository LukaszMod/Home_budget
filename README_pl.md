# Home Budget — Instrukcja uruchomienia (Polski)

To repozytorium zawiera aplikację do zarządzania budżetem domowym: backend napisany w Rust (axum + sqlx + Postgres) oraz frontend w TypeScript/React (Vite + MUI).

---

## 📁 Struktura Projektu

### Frontend

```
frontend/src/
├── components/           # Komponenty UI pogrupowane według funkcjonalności
│   ├── common/          # Wspólne komponenty używane w całej aplikacji
│   │   ├── NavBar.tsx
│   │   ├── Notifier.tsx
│   │   ├── StyledModal.tsx
│   │   └── CalcTextField.tsx
│   ├── budget/          # Komponenty związane z budżetem
│   │   ├── BudgetCalendar.tsx
│   │   ├── BudgetStatistics.tsx
│   │   ├── BudgetStatisticsBar.tsx
│   │   └── BudgetTable.tsx
│   ├── categories/      # Komponenty kategorii
│   │   ├── CategoriesDataGrid.tsx
│   │   └── CategoriesTable.tsx
│   ├── assets/          # Komponenty aktywów (konta, inwestycje)
│   │   ├── AddAssetModal.tsx
│   │   ├── AssetValuationsDialog.tsx
│   │   └── InvestmentTransactionsDialog.tsx
│   ├── operations/      # Komponenty operacji finansowych
│   │   ├── AddOperationModal.tsx
│   │   ├── SplitOperationDialog.tsx
│   │   ├── TextFieldWithHashtagSuggestions.tsx
│   │   └── TransferDialog.tsx
│   ├── users/           # Komponenty użytkowników i kont
│   │   ├── AddAccountModal.tsx
│   │   ├── AccountsSummary.tsx
│   │   └── UsersPanel.tsx
│   └── index.ts         # Plik eksportujący wszystkie komponenty
├── hooks/               # Custom React hooks
│   ├── useAccountsData.ts
│   ├── useAssets.ts
│   ├── useAssetTypes.ts
│   ├── useAssetValuations.ts
│   ├── useBudgetData.ts
│   ├── useCategories.ts
│   ├── useGoals.ts
│   ├── useHashtags.ts
│   ├── useInvestmentTransactions.ts
│   ├── useOperations.ts
│   ├── useRecurringOperations.ts
│   ├── useTransfer.ts
│   └── index.ts         # Plik eksportujący wszystkie hooki
├── pages/               # Strony aplikacji (routing)
│   ├── Assets.tsx
│   ├── Budget.tsx
│   ├── Categories.tsx
│   ├── Goals.tsx
│   ├── Hashtags.tsx
│   ├── Operations.tsx
│   ├── RecurringOperations.tsx
│   ├── Statistics.tsx
│   └── Users.tsx
├── lib/                 # Biblioteki pomocnicze
│   └── api.ts          # Klient API
├── App.tsx             # Główny komponent aplikacji
├── main.tsx            # Entry point
├── store.ts            # Zustand store
├── theme.ts            # Material-UI theme
├── i18n.ts             # Internationalization
└── style.css           # Globalne style
```

### Backend

```
backend/
├── src/
│   ├── handlers/        # Handlery API (business logic)
│   │   ├── mod.rs
│   │   ├── users.rs
│   │   ├── categories.rs
│   │   ├── operations.rs
│   │   ├── transfers.rs
│   │   ├── budgets.rs
│   │   ├── goals.rs
│   │   ├── hashtags.rs
│   │   ├── recurring_operations.rs
│   │   └── accounts_compat.rs
│   ├── models.rs        # Modele danych (structs)
│   ├── routes.rs        # Definicje ścieżek API
│   ├── utils.rs         # Funkcje pomocnicze
│   ├── asset_handlers.rs # Handlery dla systemu aktywów
│   └── main.rs          # Entry point
├── migrations/          # Migracje SQL
│   ├── 20251125214844_init.sql
│   ├── 20251127104000_sqlx_seed_polish.sql
│   ├── 20251212000000_add_split_operations.sql
│   └── 20251213120000_add_account_balance_trigger.sql
├── tests/              # Testy integracyjne
│   └── integration_tests.rs
└── Cargo.toml          # Konfiguracja Rust
```

---

## 🔑 Kluczowe Funkcjonalności

### Split Operations (Operacje Dzielone)
- Możliwość podziału jednej operacji na wiele kategorii
- Automatyczne zarządzanie relacjami parent-child
- Inline tworzenie w modalu operacji
- Edycja splitowanych operacji

### Automatic Account Balance
- Automatyczne przeliczanie stanów kont przez trigger SQL
- Aktualizacja w czasie rzeczywistym po każdej operacji
- Pomijanie dzieci operacji splitowanych w obliczeniach

### Assets System
- Zarządzanie różnymi typami aktywów (płynne, inwestycje, nieruchomości, pojazdy, wartościowe, zobowiązania)
- Historia transakcji inwestycyjnych
- Historia wycen aktywów
- Transfery między aktywami

### URL Routing
- React Router dla nawigacji opartej na URL
- Bookmarking i history browser
- Bezpośrednie linki do stron

---

## 📚 Technologie

### Frontend
- React 18 + TypeScript
- Material-UI
- React Query (TanStack Query)
- React Hook Form
- React Router
- i18next
- Zustand

### Backend
- Rust + Axum
- PostgreSQL
- SQLx
- Tokio (async runtime)

---

## 🚀 Szybkie uruchomienie

Poniżej opis krok po kroku jak postawić środowisko lokalnie (backend i frontend).

### Wymagania wstępne
- Rust (rustup + cargo)
- PostgreSQL (lokalny lub zdalny dostęp)
- Node.js 18+ i npm (można też użyć pnpm/yarn)
- Opcjonalnie: `sqlx-cli` do uruchamiania migracji (zalecane)

### Backend

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

### Frontend

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

### Testy Backend

```bash
cd backend
cargo test
```

---

## 📝 Konwencje

### Nazewnictwo Komponentów
- PascalCase dla komponentów React
- camelCase dla hooków (prefiks `use`)
- Opisowe nazwy odzwierciedlające funkcjonalność

### Organizacja Plików
- Komponenty grupowane według funkcjonalności
- Każdy komponent w osobnym pliku
- Index pliki dla wygodnego importowania

### Import Pattern
```typescript
// Dobry sposób (przez index)
import { NavBar, StyledModal } from '../components'
import { useAssets, useOperations } from '../hooks'

// Też OK (bezpośredni import)
import NavBar from '../components/common/NavBar'
import { useAssets } from '../hooks/useAssets'
```

### Workflow Git
1. Commit małych, atomowych zmian
2. Opisowe wiadomości commit
3. Testowanie przed commit
4. Regular push do origin

---

## ⚙️ Zmienne środowiskowe
- `backend/.env` — `DATABASE_URL` (connection string do Postgresa) i `RUST_LOG`.
- `frontend` może używać `VITE_BACKEND_URL` przy buildzie/uruchomieniu.

---

## ❗ Najczęstsze problemy
- Migracje wydają się aplikowane, ale nie widzisz zmian — upewnij się, że przed `sqlx migrate run` załadowałeś te same zmienne środowiskowe (`export $(grep -v '^#' backend/.env | xargs)`).
- Port 3000 zajęty — zmień nasłuchiwanie w `backend/src/main.rs` i przebuduj.
- Błędy builda frontendu związane z MUI — sprawdź wersję Node i czy pakiety MUI są zainstalowane.

---

## 📋 Najważniejsze komendy

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

# Testy backend
cd backend
cargo test
```

---

## 📌 Uwagi końcowe
- Projekt jest przykładowy. Dostosuj poświadczenia i konfigurację do środowiska produkcyjnego.
- Regularnie wykonuj backup bazy danych.
- W produkcji używaj właściwej konfiguracji CORS i zmiennych środowiskowych.
