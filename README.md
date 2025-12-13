# Home Budget — Setup Instructions

This repository contains a home budget management application: backend written in Rust (axum + sqlx + Postgres) and frontend in TypeScript/React (Vite + MUI).

---

## 📁 Project Structure

### Frontend

```
frontend/src/
├── components/           # UI components grouped by functionality
│   ├── common/          # Shared components used across the application
│   │   ├── NavBar.tsx
│   │   ├── Notifier.tsx
│   │   ├── StyledModal.tsx
│   │   └── CalcTextField.tsx
│   ├── budget/          # Budget-related components
│   │   ├── BudgetCalendar.tsx
│   │   ├── BudgetStatistics.tsx
│   │   ├── BudgetStatisticsBar.tsx
│   │   └── BudgetTable.tsx
│   ├── categories/      # Category components
│   │   ├── CategoriesDataGrid.tsx
│   │   └── CategoriesTable.tsx
│   ├── assets/          # Asset components (accounts, investments)
│   │   ├── AddAssetModal.tsx
│   │   ├── AssetValuationsDialog.tsx
│   │   └── InvestmentTransactionsDialog.tsx
│   ├── operations/      # Financial operation components
│   │   ├── AddOperationModal.tsx
│   │   ├── SplitOperationDialog.tsx
│   │   ├── TextFieldWithHashtagSuggestions.tsx
│   │   └── TransferDialog.tsx
│   ├── users/           # User and account components
│   │   ├── AddAccountModal.tsx
│   │   ├── AccountsSummary.tsx
│   │   └── UsersPanel.tsx
│   └── index.ts         # File exporting all components
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
│   └── index.ts         # File exporting all hooks
├── pages/               # Application pages (routing)
│   ├── Assets.tsx
│   ├── Budget.tsx
│   ├── Categories.tsx
│   ├── Goals.tsx
│   ├── Hashtags.tsx
│   ├── Operations.tsx
│   ├── RecurringOperations.tsx
│   ├── Statistics.tsx
│   └── Users.tsx
├── lib/                 # Helper libraries
│   └── api.ts          # API client
├── App.tsx             # Main application component
├── main.tsx            # Entry point
├── store.ts            # Zustand store
├── theme.ts            # Material-UI theme
├── i18n.ts             # Internationalization
└── style.css           # Global styles
```

### Backend

```
backend/
├── src/
│   ├── handlers/        # API handlers (business logic)
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
│   ├── models.rs        # Data models (structs)
│   ├── routes.rs        # API route definitions
│   ├── utils.rs         # Helper functions
│   ├── asset_handlers.rs # Handlers for asset system
│   └── main.rs          # Entry point
├── migrations/          # SQL migrations
│   ├── 20251125214844_init.sql
│   ├── 20251127104000_sqlx_seed_polish.sql
│   ├── 20251212000000_add_split_operations.sql
│   └── 20251213120000_add_account_balance_trigger.sql
├── tests/              # Integration tests
│   └── integration_tests.rs
└── Cargo.toml          # Rust configuration
```

---

## 🔑 Key Features

### Split Operations
- Ability to split one operation into multiple categories
- Automatic parent-child relationship management
- Inline creation in operation modal
- Edit split operations

### Automatic Account Balance
- Automatic account balance calculation via SQL trigger
- Real-time updates after each operation
- Exclusion of split operation children from calculations

### Assets System
- Management of different asset types (liquid, investments, real estate, vehicles, valuables, liabilities)
- Investment transaction history
- Asset valuation history
- Transfers between assets

### URL Routing
- React Router for URL-based navigation
- Bookmarking and browser history
- Direct links to pages

---

## 📚 Technologies

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

## 🚀 Quick Start

Step-by-step guide to set up the local environment (backend and frontend).

### Prerequisites
- Rust (rustup + cargo)
- PostgreSQL (local or remote access)
- Node.js 18+ and npm (can also use pnpm/yarn)
- Optional: `sqlx-cli` for running migrations (recommended)

### Backend

1. Prepare the database

   Make sure PostgreSQL is running and create the database mentioned in `backend/.env` (default `home_budget`).

   Example (user `postgres` has permissions to create databases):

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE home_budget;"
   ```

2. Install sqlx-cli (optional)

   ```bash
   cargo install sqlx-cli --no-default-features --features postgres,rustls
   ```

3. Run migrations

   Load variables from `.env` and run migrations in the `backend` directory:

   ```bash
   cd backend
   export $(grep -v '^#' .env | xargs)
   sqlx migrate run
   ```

   If you don't have `sqlx-cli`, you can manually execute SQL files using `psql`.

4. Run backend

   ```bash
   # development mode
   cargo run

   # or production mode
   cargo run --release
   ```

   Server listens on `127.0.0.1:3000` (check `backend/src/main.rs`).

5. Check endpoint

   ```bash
   curl -sS http://127.0.0.1:3000/accounts | jq
   ```

### Frontend

1. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Run dev server

   Frontend expects the backend at the address set in `VITE_BACKEND_URL` or defaults to `http://localhost:3000`.

   ```bash
   npm run dev
   ```

3. Production build

   ```bash
   npm run build
   npm run preview
   ```

### Backend Tests

```bash
cd backend
cargo test
```

---

## 📝 Conventions

### Component Naming
- PascalCase for React components
- camelCase for hooks (prefix `use`)
- Descriptive names reflecting functionality

### File Organization
- Components grouped by functionality
- Each component in a separate file
- Index files for convenient importing

### Import Pattern
```typescript
// Good approach (via index)
import { NavBar, StyledModal } from '../components'
import { useAssets, useOperations } from '../hooks'

// Also OK (direct import)
import NavBar from '../components/common/NavBar'
import { useAssets } from '../hooks/useAssets'
```

### Git Workflow
1. Commit small, atomic changes
2. Descriptive commit messages
3. Test before commit
4. Regular push to origin

---

## ⚙️ Environment Variables
- `backend/.env` — `DATABASE_URL` (Postgres connection string) and `RUST_LOG`.
- `frontend` can use `VITE_BACKEND_URL` for build/run.

---

## ❗ Common Issues
- Migrations seem applied but you don't see changes — make sure you loaded the same environment variables before `sqlx migrate run` (`export $(grep -v '^#' backend/.env | xargs)`).
- Port 3000 busy — change listening in `backend/src/main.rs` and rebuild.
- Frontend build errors related to MUI — check Node version and whether MUI packages are installed.

---

## 📋 Key Commands

```bash
# Load env and run migrations
cd backend
export $(grep -v '^#' .env | xargs)
sqlx migrate run

# Run backend
cargo run

# Run frontend (dev)
cd frontend
npm install
npm run dev

# Build frontend
npm run build

# Backend tests
cd backend
cargo test
```

---

## 📌 Final Notes
- This is a sample project. Adjust credentials and configuration for production environment.
- Regularly backup your database.
- In production, use proper CORS configuration and environment variables.
