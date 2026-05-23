import path from 'node:path';
import { expect, type Page } from '@playwright/test';

export const PROJECT_ID = 'mendes-company-os-dev';
// Em Docker o emulador é alcançado pelo nome do serviço; no host, por localhost.
const EMU_HOST = process.env.E2E_EMULATOR_HOST || 'localhost';
export const EMU_AUTH = `http://${EMU_HOST}:9099`;
export const EMU_FIRESTORE = `http://${EMU_HOST}:8080`;

export const TEST_EMAIL = 'e2e@mendescompany.test';
export const TEST_PASSWORD = 'e2e-Password-123';

const SAMPLES = path.resolve(__dirname, '../../samples/notas-fiscais');
export const SAMPLE_BH = path.join(SAMPLES, 'prefeitura-de-bh', 'nfse_202500000000003.xml');
export const SAMPLE_NACIONAL = path.join(
  SAMPLES,
  'emissor-nacional',
  '31062002241749998000109000000000000926056753970113.xml',
);

/** PDF de exemplo para anexar em invoices nos testes. */
export const SAMPLE_INVOICE_PDF = path.resolve(__dirname, '../../samples/invoices/NP-001-2026-02 - Signed.pdf');

/** Signs in through the login screen and waits for the Home screen. */
export async function login(page: Page): Promise<void> {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill(TEST_PASSWORD);
  await page.getByText('Entrar', { exact: true }).click();
  await expect(page.getByText('Bem-vindo(a)')).toBeVisible();
}
