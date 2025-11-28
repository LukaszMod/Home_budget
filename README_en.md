# Home Budget — Development setup (English)

This repository contains a simple home budget application with a Rust backend (axum + sqlx + Postgres) and a TypeScript React frontend (Vite + MUI).

This README explains how to set up and run the project locally (backend + frontend).

Prerequisites
- Rust toolchain (rustup + cargo)
- PostgreSQL server (local or accessible server)
- Node.js 18+ and npm (or pnpm/yarn)
- Optional: `sqlx-cli` for migrations (recommended)

Quick start — backend

1. Prepare database

   Ensure PostgreSQL is running and create the database referenced in `backend/.env` (default: `home_budget`).

   Example (run as a user with permission to create DB, often `postgres`):

   ```bash
   sudo -u postgres psql -c "CREATE DATABASE home_budget;"
   ```

2. Install sqlx-cli (optional but useful)

   ```bash
   cargo install sqlx-cli --no-default-features --features postgres,rustls
   ```

3. Apply migrations

   Load the `.env` variables and run migrations from the `backend` folder:

   ```bash
   cd backend
   export $(grep -v '^#' .env | xargs)
   sqlx migrate run
   ```

   If you do not have `sqlx-cli`, you can run the SQL files manually with `psql`.

4. Run the backend

   ```bash
   # dev mode
   cargo run

   # or production build
   cargo run --release
   ```

   The server listens on `127.0.0.1:3000` by default (see `backend/src/main.rs`).

5. Verify backend is up

   ```bash
   curl -sS http://127.0.0.1:3000/accounts | jq
   ```

Quick start — frontend

1. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Development server

   By default the frontend expects the backend at `VITE_BACKEND_URL` env var or `http://localhost:3000`.

   ```bash
   # start dev server
   npm run dev
   ```

3. Build for production

   ```bash
   npm run build
   # preview
   npm run preview
   ```

Environment variables
- `backend/.env` — contains `DATABASE_URL` (Postgres connection string) and `RUST_LOG` for logging.
- `frontend` can read `VITE_BACKEND_URL` at build/dev time to point to a custom backend URL.

Common troubleshooting
- If migrations say they were applied but DB doesn't show changes, ensure you loaded the same `DATABASE_URL` used by the app. Use `export $(grep -v '^#' backend/.env | xargs)` before `sqlx migrate run`.
- If port `3000` is busy, change the address in `backend/src/main.rs` and recompile.
- If you get errors building frontend related to MUI, ensure Node >= 18 and that `@mui/*` packages are installed.

Useful commands summary

```bash
# apply backend migrations
cd backend
export $(grep -v '^#' .env | xargs)
sqlx migrate run

# run backend
cargo run

# run frontend (dev)
cd frontend
npm install
npm run dev

# build frontend
npm run build
```

License / notes
- This project is a development example. Adjust database credentials and secrets for production.
