#!/usr/bin/env bash
# Para e REMOVE os containers do projeto (mantém os volumes nomeados).
set -euo pipefail

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; CYAN=''; GREEN=''; DIM=''; RESET=''
fi

usage() {
  cat <<EOF
${BOLD}Uso:${RESET} ./scripts/down.sh [--help]

Para e ${BOLD}remove${RESET} os containers do projeto (web + emuladores).
Mantém os volumes nomeados (node_modules do container e dados do emulador),
então o próximo ./scripts/dev.sh sobe rápido e sem reinstalar nada.

${BOLD}Opções:${RESET}
  ${GREEN}-h, --help${RESET}    Mostra esta ajuda.

${DIM}Para apagar TAMBÉM os volumes: docker compose down -v${RESET}
EOF
}
case "${1:-}" in -h | --help) usage; exit 0 ;; esac

cd "$(dirname "$0")/.."

echo "${CYAN}▶${RESET} Parando e removendo containers do projeto…"
docker compose down --remove-orphans

echo "${GREEN}✅ Containers removidos.${RESET} ${DIM}Volumes preservados.${RESET}"
