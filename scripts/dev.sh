#!/usr/bin/env bash
# Sobe app web + emuladores Firebase e REMOVE os containers ao parar (Ctrl+C).
set -euo pipefail

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; CYAN=''; GREEN=''; DIM=''; RESET=''
fi

usage() {
  cat <<EOF
${BOLD}Uso:${RESET} ./scripts/dev.sh [--help]

Sobe o ambiente de desenvolvimento (Docker): ${BOLD}app web + emuladores Firebase${RESET}.
  ${CYAN}App web:${RESET}      http://localhost:3005
  ${CYAN}Emulator UI:${RESET}  http://localhost:4000

Os logs ficam em foreground; ao parar com ${BOLD}Ctrl+C${RESET} os containers são
${BOLD}removidos automaticamente${RESET} (os volumes nomeados são preservados).

${BOLD}Opções:${RESET}
  ${GREEN}-h, --help${RESET}    Mostra esta ajuda.
EOF
}
case "${1:-}" in -h | --help) usage; exit 0 ;; esac

cd "$(dirname "$0")/.."

# Ao sair (Ctrl+C ou erro), para e REMOVE todos os containers do projeto (web + emuladores),
# preservando os volumes nomeados (não há nenhum persistente aqui hoje).
trap 'echo; echo "${CYAN}▶${RESET} Parando e removendo containers…"; docker compose down --remove-orphans' EXIT

echo "${CYAN}▶${RESET} Subindo app web + emuladores Firebase…"
echo "   ${BOLD}App web:${RESET}      http://localhost:3005"
echo "   ${BOLD}Emulator UI:${RESET}  http://localhost:4000"
echo "   ${DIM}Ctrl+C para parar e remover os containers.${RESET}"
echo ""

# Foreground: `--build` reconstrói automaticamente só quando o package.json muda
# (cache de camadas do Docker); `-V` re-semeia o node_modules (volume anônimo) a partir
# da imagem. `web` puxa o emulador via depends_on; ao parar (Ctrl+C) o trap remove tudo.
docker compose up --build -V web
