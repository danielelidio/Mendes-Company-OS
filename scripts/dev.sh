#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

EXPO_URL="${EXPO_URL:-http://localhost:8082}"

echo "==> Booting Docker Compose stack (back-end + expo web)"
docker compose up --build -d

echo "==> Waiting for Expo web at $EXPO_URL ..."
until curl -sSf "$EXPO_URL" > /dev/null 2>&1; do
  sleep 2
  echo "    still waiting..."
done

echo "==> Expo web is up. Launching Electron on the host."
cd "$ROOT_DIR/app"
npm run electron:dev
