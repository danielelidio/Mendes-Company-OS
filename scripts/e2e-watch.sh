#!/usr/bin/env bash
# Roda os testes E2E com navegador visível e em câmera lenta, para assistir.
# Garante os emuladores Firebase antes.
set -euo pipefail

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; CYAN=''; GREEN=''; DIM=''; RESET=''
fi

usage() {
  cat <<EOF
${BOLD}Uso:${RESET} ./scripts/e2e-watch.sh [ms] [args do Playwright]

Roda os testes E2E com o navegador ${BOLD}visível${RESET} e em ${BOLD}câmera lenta${RESET},
pausando antes de cada ação para dar tempo de acompanhar. Garante os
emuladores Firebase antes e sobe o app web em ${CYAN}http://localhost:3010${RESET}.

${BOLD}Argumentos:${RESET}
  ${GREEN}ms${RESET}            Atraso entre as ações em milissegundos (padrão: ${BOLD}600${RESET}).
                Se o primeiro argumento for um número, é usado como atraso.
  ${GREEN}-h, --help${RESET}    Mostra esta ajuda.

${DIM}Os demais argumentos são repassados ao Playwright, por exemplo:${RESET}
  ./scripts/e2e-watch.sh                       # tudo, 600ms entre ações
  ./scripts/e2e-watch.sh 1000                  # mais devagar (1s entre ações)
  ./scripts/e2e-watch.sh 800 invoices.spec.ts  # só um arquivo, 800ms
  ./scripts/e2e-watch.sh -g "login"            # filtra pelo título do teste

${DIM}Dica: para depurar passo a passo, use ${RESET}./scripts/e2e-ui.sh${DIM} (modo UI).${RESET}
EOF
}
case "${1:-}" in -h | --help) usage; exit 0 ;; esac

# Primeiro argumento numérico = atraso (ms); senão usa o padrão.
SLOWMO=600
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  SLOWMO="$1"; shift
fi

cd "$(dirname "$0")/.."

echo "${CYAN}▶${RESET} Garantindo emuladores Firebase…"
docker compose up -d firebase-emulators

echo "${CYAN}▶${RESET} Aguardando emuladores…"
for _ in $(seq 1 30); do
  curl -s -m 2 http://localhost:9099/ >/dev/null 2>&1 && break
  sleep 2
done

echo "${CYAN}▶${RESET} Rodando E2E ${BOLD}headed${RESET} em câmera lenta (${GREEN}${SLOWMO}ms${RESET} entre ações)…"
cd app
E2E_SLOWMO="$SLOWMO" npm run e2e -- --headed "$@"
