#!/usr/bin/env bash
# Roda os testes E2E (headless). Garante os emuladores Firebase antes.
# Args extras são repassados ao Playwright, ex.: ./scripts/e2e.sh --headed
set -euo pipefail

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; CYAN=''; GREEN=''; DIM=''; RESET=''
fi

usage() {
  cat <<EOF
${BOLD}Uso:${RESET} ./scripts/e2e.sh [--help] [args do Playwright]

Roda os testes E2E (headless). Garante os emuladores Firebase antes e
sobe o app web de teste em ${CYAN}http://localhost:3010${RESET}.

${BOLD}Opções:${RESET}
  ${GREEN}-h, --help${RESET}    Mostra esta ajuda.

${DIM}Args extras são repassados ao Playwright, por exemplo:${RESET}
  ./scripts/e2e.sh --headed                # navegador visível
  ./scripts/e2e.sh notas-fiscais.spec.ts   # só um arquivo
  ./scripts/e2e.sh -g "login"              # filtra pelo título do teste

${DIM}Para assistir (visível + câmera lenta) use ${RESET}./scripts/e2e-watch.sh${DIM},${RESET}
${DIM}ou rode em câmera lenta direto: ${RESET}E2E_SLOWMO=600 ./scripts/e2e.sh --headed
EOF
}
case "${1:-}" in -h | --help) usage; exit 0 ;; esac

cd "$(dirname "$0")/.."

echo "${CYAN}▶${RESET} Garantindo emuladores Firebase…"
docker compose up -d firebase-emulators

echo "${CYAN}▶${RESET} Aguardando emuladores…"
for _ in $(seq 1 30); do
  curl -s -m 2 http://localhost:9099/ >/dev/null 2>&1 && break
  sleep 2
done

cd app
npm run e2e -- "$@"
