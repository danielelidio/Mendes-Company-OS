#!/usr/bin/env bash
# Roda os testes E2E dentro do Docker (headless por padrão; --headed via Xvfb grava vídeo).
set -euo pipefail

if [ -t 1 ] && [ -z "${NO_COLOR:-}" ]; then
  BOLD=$'\033[1m'; CYAN=$'\033[36m'; GREEN=$'\033[32m'; DIM=$'\033[2m'; RESET=$'\033[0m'
else
  BOLD=''; CYAN=''; GREEN=''; DIM=''; RESET=''
fi

usage() {
  cat <<EOF
${BOLD}Uso:${RESET} ./scripts/e2e-docker.sh [--help] [--headed] [args do Playwright]

Roda os testes E2E ${BOLD}dentro do Docker${RESET} (imagem oficial do Playwright),
contra os emuladores Firebase. O app web de teste sobe dentro do container.

${BOLD}Opções:${RESET}
  ${GREEN}-h, --help${RESET}    Mostra esta ajuda.
  ${GREEN}--headed${RESET}      Roda "com cabeça" via Xvfb (não visível ao vivo) e ${BOLD}grava vídeo${RESET} para revisar.

Args extras são repassados ao Playwright, por exemplo:
  ./scripts/e2e-docker.sh notas-fiscais.spec.ts
  ./scripts/e2e-docker.sh -g "login"

${DIM}Depois do run (relatório + vídeos ficam no host):${RESET}
  cd app && npx playwright show-report
EOF
}

HEADED=0
REST=()
while [ $# -gt 0 ]; do
  case "$1" in
    -h | --help) usage; exit 0 ;;
    --headed) HEADED=1; shift ;;
    *) REST+=("$1"); shift ;;
  esac
done

cd "$(dirname "$0")/.."

echo "${CYAN}▶${RESET} Garantindo emuladores Firebase…"
docker compose up -d firebase-emulators

echo "${CYAN}▶${RESET} Aguardando emuladores…"
for _ in $(seq 1 30); do
  curl -s -m 2 http://localhost:9099/ >/dev/null 2>&1 && break
  sleep 2
done

echo "${CYAN}▶${RESET} Build da imagem de testes (cacheado após a 1ª vez)…"
docker compose build e2e

if [ "$HEADED" = "1" ]; then
  echo "${CYAN}▶${RESET} Rodando E2E ${BOLD}headed${RESET} (Xvfb, gravando vídeo)…"
  docker compose run --rm -e E2E_VIDEO=on e2e xvfb-run -a npx playwright test --headed ${REST[@]+"${REST[@]}"}
else
  echo "${CYAN}▶${RESET} Rodando E2E ${BOLD}headless${RESET}…"
  docker compose run --rm e2e npx playwright test ${REST[@]+"${REST[@]}"}
fi

echo "${GREEN}✅ Concluído.${RESET} ${DIM}Relatório: cd app && npx playwright show-report${RESET}"
