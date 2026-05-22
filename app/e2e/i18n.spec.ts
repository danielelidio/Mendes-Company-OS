import { test, expect } from '@playwright/test';
import { login } from './support';

test('alterna idioma pt ⇄ en pelo seletor do topo', async ({ page }) => {
  await login(page); // app inicia em português (padrão)

  // Home em português
  await expect(page.getByText('Sair', { exact: true })).toBeVisible();

  // abre o seletor (mostra "Português") e escolhe inglês
  await page.getByText('Português', { exact: true }).click();
  await page.getByText('English', { exact: true }).click();

  // app em inglês
  await expect(page.getByText('Sign out', { exact: true })).toBeVisible();

  // navega pela sidebar (SPA mantém o idioma) para Clientes em inglês
  await page.getByText('Clients', { exact: true }).click();
  await expect(page.getByText('New client')).toBeVisible();

  // volta para português (mesma tela re-renderiza ao vivo)
  await page.getByText('English', { exact: true }).click();
  await page.getByText('Português', { exact: true }).click();
  await expect(page.getByText('Novo cliente')).toBeVisible();
});
