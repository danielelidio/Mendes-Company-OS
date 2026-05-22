# Imagem oficial do Playwright (navegadores + libs + Xvfb já incluídos).
# A tag DEVE casar com a versão do @playwright/test (1.60.0).
FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

# Dependências do app instaladas para Linux (os navegadores já vêm na imagem).
COPY package.json package-lock.json ./
RUN npm install --no-audit --no-fund

ENV EXPO_NO_TELEMETRY=1

# O comando é definido no docker compose run (headless ou xvfb-run --headed).
