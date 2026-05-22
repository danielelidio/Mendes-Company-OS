import { defineConfig, devices } from '@playwright/test';

const PORT = 3010;
// No host: localhost. No Docker: o nome do serviço do compose (ex.: firebase-emulators).
const EMULATOR_HOST = process.env.E2E_EMULATOR_HOST || 'localhost';

/**
 * E2E runs the web app (on PORT) against the Firebase Emulator Suite.
 * Prerequisite: emulators running — `docker compose up -d firebase-emulators`.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  globalSetup: './e2e/global-setup.ts',
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
    // Vídeo desligado por padrão; o run headed em Docker liga via E2E_VIDEO=on para revisão.
    video: process.env.E2E_VIDEO === 'on' ? 'on' : 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npx expo start --web --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    timeout: 180_000,
    reuseExistingServer: true,
    env: {
      EXPO_PUBLIC_USE_FIREBASE_EMULATOR: 'true',
      EXPO_PUBLIC_FIREBASE_EMULATOR_HOST: EMULATOR_HOST,
    },
  },
});
