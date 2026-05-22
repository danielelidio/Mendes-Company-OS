import { test, expect } from '@playwright/test';
import { login, TEST_EMAIL } from './support';

test('login válido leva à Home', async ({ page }) => {
  await login(page);
  await expect(page.getByText(TEST_EMAIL).first()).toBeVisible();
});

test('usuário inexistente mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill('naoexiste@mendescompany.test');
  await page.getByPlaceholder('••••••••').fill('senhaErrada123');
  await page.getByText('Entrar', { exact: true }).click();
  await expect(page.getByText('Email ou senha inválidos.')).toBeVisible();
  await expect(page.getByText('Entre para continuar')).toBeVisible();
});

test('senha incorreta para usuário existente mostra erro', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill('senhaTotalmenteErrada');
  await page.getByText('Entrar', { exact: true }).click();
  await expect(page.getByText('Email ou senha inválidos.')).toBeVisible();
});

test('email com formato inválido mostra erro de validação', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('you@example.com').fill('isto-nao-e-email');
  await page.getByPlaceholder('••••••••').fill('qualquer123');
  await page.getByText('Entrar', { exact: true }).click();
  await expect(page.getByText('Informe um email válido.')).toBeVisible();
});

test('botão "Entrar" fica desabilitado com campos vazios', async ({ page }) => {
  await page.goto('/login');
  const button = page.getByText('Entrar', { exact: true }).locator('..');
  await expect(button).toHaveAttribute('aria-disabled', 'true');

  // preenchendo os dois campos, habilita
  await page.getByPlaceholder('you@example.com').fill(TEST_EMAIL);
  await page.getByPlaceholder('••••••••').fill('algumaSenha');
  await expect(button).not.toHaveAttribute('aria-disabled', 'true');
});

test('sign out volta para a tela de login', async ({ page }) => {
  await login(page);
  await page.getByText('Sair', { exact: true }).click();
  await expect(page.getByText('Entre para continuar')).toBeVisible();

  // rotas protegidas continuam bloqueadas após sair
  await page.goto('/clientes');
  await expect(page.getByText('Entre para continuar')).toBeVisible();
});

test('menu de usuário (topo direito) faz logout', async ({ page }) => {
  await login(page);
  await page.getByLabel('Menu do usuário').click();
  await page.getByLabel('Sair').click();
  await expect(page.getByText('Entre para continuar')).toBeVisible();
});

test('sessão persiste após recarregar a página', async ({ page }) => {
  await login(page);
  await page.reload();
  await expect(page.getByText('Bem-vindo(a)')).toBeVisible();
  await expect(page.getByText(TEST_EMAIL).first()).toBeVisible();
});

test('usuário logado é redirecionado de /login para a Home', async ({ page }) => {
  await login(page);
  await page.goto('/login');
  await expect(page.getByText('Bem-vindo(a)')).toBeVisible();
});

test('rota protegida redireciona para login quando deslogado', async ({ page }) => {
  await page.goto('/clientes');
  await expect(page.getByText('Entre para continuar')).toBeVisible();
});
