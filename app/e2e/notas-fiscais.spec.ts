import { test, expect } from '@playwright/test';
import { login, SAMPLE_BH, SAMPLE_NACIONAL } from './support';

test('importa Notas Fiscais (XML) com barra de status e popula a tabela ao vivo', async ({ page }) => {
  await login(page);
  await page.goto('/contabilidade/notas-fiscais/upload');

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Selecionar XMLs').click();
  await (await chooserPromise).setFiles([SAMPLE_BH, SAMPLE_NACIONAL]);

  // O upload roda em background com uma barra de status global. A barra só existe
  // enquanto `busy` (sub-segundo), então afirmar capturá-la num instante exato é
  // intrinsecamente sensível a timing (câmera lenta/carga). Validamos de forma
  // determinística: a barra em progresso OU o resumo de conclusão (estável na tela).
  await expect(
    page.getByText(/Fazendo Upload de Notas Fiscais|2 notas importadas de 2/),
  ).toBeVisible({ timeout: 30_000 });
  // resumo final de conclusão (permanece na tela de upload)
  await expect(page.getByText(/2 notas importadas de 2/)).toBeVisible({ timeout: 60_000 });

  // a lista popula via assinatura em tempo real (onSnapshot)
  await page.goto('/contabilidade/notas-fiscais');
  await expect(page.getByText('NPath Labs, LLC').first()).toBeVisible();
  // COM moeda estrangeira (Sistema Nacional): R$ ... (US$ ...)
  await expect(page.getByText(/47\.732,14.*US\$.*8\.950,00/)).toBeVisible();
  // SEM moeda estrangeira (Prefeitura de BH): só R$, sem US$
  const semMoeda = page.getByText(/52\.887,61/);
  await expect(semMoeda).toBeVisible();
  await expect(semMoeda).not.toContainText('US$');
});

test('o cliente criado pelo upload aparece na tabela de clientes (tempo real)', async ({ page }) => {
  await login(page);
  await page.goto('/clientes');
  // "NPath Labs, LLC" foi criado pelo upload do teste anterior e reflete na tabela ao vivo
  await expect(page.getByText('NPath Labs, LLC').first()).toBeVisible({ timeout: 30_000 });
});

test('reimportar a mesma nota marca como já existente', async ({ page }) => {
  await login(page);
  await page.goto('/contabilidade/notas-fiscais/upload');

  const chooserPromise = page.waitForEvent('filechooser');
  await page.getByText('Selecionar XMLs').click();
  await (await chooserPromise).setFiles([SAMPLE_BH]);

  await expect(page.getByText(/Já importada anteriormente/)).toBeVisible({ timeout: 60_000 });
});
