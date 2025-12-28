#!/bin/bash

# Skrypt do uruchamiania aplikacji Home Budget
# Uruchamia backend (Rust) i frontend (Node.js) jednocześnie

set -e

# Kolory do logów
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Funkcja do czyszczenia procesów przy wyjściu
cleanup() {
    echo -e "\n${RED}Zatrzymywanie aplikacji...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${GREEN}=== Uruchamianie Home Budget ===${NC}\n"

# Sprawdź czy istnieje .env w backend
if [ ! -f backend/.env ]; then
    echo -e "${RED}Błąd: Plik backend/.env nie istnieje!${NC}"
    echo "Utwórz plik backend/.env z odpowiednią konfiguracją."
    exit 1
fi

# Uruchom backend
echo -e "${BLUE}[Backend]${NC} Uruchamianie serwera Rust..."
cd backend
export $(grep -v '^#' .env | xargs)
cargo run 2>&1 | sed "s/^/[Backend] /" &
BACKEND_PID=$!
cd ..

# Poczekaj chwilę na start backendu
sleep 2

# Uruchom frontend
echo -e "${BLUE}[Frontend]${NC} Uruchamianie aplikacji React..."
cd frontend
npm install
npm run dev 2>&1 | sed "s/^/[Frontend] /" &
FRONTEND_PID=$!
cd ..

echo -e "\n${GREEN}✓ Aplikacja uruchomiona!${NC}"
echo -e "Backend PID: ${BACKEND_PID}"
echo -e "Frontend PID: ${FRONTEND_PID}"

# Poczekaj na pełne uruchomienie frontendu i otwórz przeglądarkę
sleep 3
echo -e "${BLUE}Otwieranie przeglądarki...${NC}"
xdg-open http://localhost:5173 2>/dev/null || true

echo -e "\nAby zatrzymać aplikację, naciśnij ${RED}Ctrl+C${NC}\n"

# Czekaj na procesy
wait
