import { test, expect, type Page } from '@playwright/test';
import { login } from './support';

/** Cria um cliente (só nome) pela UI e volta para a lista. */
async function novoCliente(page: Page, nome: string) {
  await page.goto('/clientes/novo');
  await page.getByLabel('Nome').fill(nome);
  await page.getByText('Salvar', { exact: true }).click();
  await expect(page).toHaveURL(/\/clientes$/);
  await expect(page.getByText(nome)).toBeVisible();
}

test('nome obrigatório: Save desabilitado e erro no blur', async ({ page }) => {
  await login(page);
  await page.goto('/clientes');
  await page.getByText('Novo cliente').click();
  await expect(page).toHaveURL(/\/clientes\/novo/);

  const salvar = page.getByText('Salvar', { exact: true }).locator('..');
  await expect(salvar).toHaveAttribute('aria-disabled', 'true'); // form inválido (nome vazio)

  // valida ao desfocar o campo vazio
  await page.getByLabel('Nome').focus();
  await page.getByLabel('Nome').blur();
  await expect(page.getByText('Informe o nome do cliente.')).toBeVisible();

  // preencher o nome habilita o Save
  await page.getByLabel('Nome').fill('Cliente Válido');
  await expect(salvar).not.toHaveAttribute('aria-disabled', 'true');
});

test('cria cliente com CPF mascarado e aparece na tabela', async ({ page }) => {
  await login(page);
  await page.goto('/clientes/novo');

  const nome = `Cliente CPF ${Date.now()}`;
  await page.getByLabel('Nome').fill(nome);
  await page.getByText('CPF', { exact: true }).click();
  await page.getByLabel('Documento').fill('39053344705');
  await expect(page.getByLabel('Documento')).toHaveValue('390.533.447-05'); // máscara conforme digita
  await page.getByText('Salvar', { exact: true }).click();

  await expect(page).toHaveURL(/\/clientes$/);
  await expect(page.getByText(nome)).toBeVisible();
  await expect(page.getByText('390.533.447-05')).toBeVisible();
});

test('CNPJ é formatado conforme digita', async ({ page }) => {
  await login(page);
  await page.goto('/clientes/novo');

  await page.getByText('CNPJ', { exact: true }).click();
  await page.getByLabel('Documento').fill('41749998000109');
  await expect(page.getByLabel('Documento')).toHaveValue('41.749.998/0001-09');
});

test('lista clientes com cabeçalhos e linhas', async ({ page }) => {
  await login(page);
  const nome = `Cliente Lista ${Date.now()}`;
  await novoCliente(page, nome);

  await expect(page.getByText('Nome', { exact: true })).toBeVisible();
  await expect(page.getByText('Documento', { exact: true })).toBeVisible();
  await expect(page.getByText('Endereço', { exact: true })).toBeVisible();
  await expect(page.getByText(nome)).toBeVisible();
});

test('edita um cliente existente', async ({ page }) => {
  await login(page);
  const original = `Cliente Edit ${Date.now()}`;
  await novoCliente(page, original);

  await page.getByLabel(`Editar ${original}`).click();
  await expect(page.getByLabel('Nome')).toHaveValue(original); // form pré-preenchido

  const editado = `Editado ${Date.now()}`;
  await page.getByLabel('Nome').fill(editado);
  await page.getByText('Salvar', { exact: true }).click();

  await expect(page).toHaveURL(/\/clientes$/);
  await expect(page.getByText(editado)).toBeVisible();
  await expect(page.getByText(original)).toHaveCount(0);
});

test('exclui um cliente (soft delete) e some da tabela', async ({ page }) => {
  await login(page);
  const nome = `Cliente Del ${Date.now()}`;
  await novoCliente(page, nome);

  page.once('dialog', (dialog) => dialog.accept()); // window.confirm
  await page.getByLabel(`Excluir ${nome}`).click();

  await expect(page.getByText(nome)).toHaveCount(0);
});

test('nome obrigatório ao editar: erro no blur e Save desabilitado', async ({ page }) => {
  await login(page);
  const nome = `Cliente EditVal ${Date.now()}`;
  await novoCliente(page, nome);

  await page.getByLabel(`Editar ${nome}`).click();
  await expect(page.getByLabel('Nome')).toHaveValue(nome);

  await page.getByLabel('Nome').fill('');
  await page.getByLabel('Nome').blur();
  await expect(page.getByText('Informe o nome do cliente.')).toBeVisible();
  await expect(page.getByText('Salvar', { exact: true }).locator('..')).toHaveAttribute('aria-disabled', 'true');
});

test('documento é obrigatório quando um tipo é selecionado', async ({ page }) => {
  await login(page);
  await page.goto('/clientes/novo');

  await page.getByLabel('Nome').fill(`Cliente DocReq ${Date.now()}`);
  await page.getByText('CPF', { exact: true }).click();

  // tipo selecionado + documento vazio → Save desabilitado e erro no blur
  await expect(page.getByText('Salvar', { exact: true }).locator('..')).toHaveAttribute('aria-disabled', 'true');
  await page.getByLabel('Documento').focus();
  await page.getByLabel('Documento').blur();
  await expect(page.getByText('Informe o documento para o tipo selecionado.')).toBeVisible();
});

test('valida o formato do documento quando preenchido', async ({ page }) => {
  await login(page);
  await page.goto('/clientes/novo');

  await page.getByLabel('Nome').fill(`Cliente DocFmt ${Date.now()}`);
  await page.getByText('CPF', { exact: true }).click();

  const salvar = page.getByText('Salvar', { exact: true }).locator('..');
  await page.getByLabel('Documento').fill('123'); // CPF incompleto
  await page.getByLabel('Documento').blur();
  await expect(page.getByText(/Documento inválido/)).toBeVisible();
  await expect(salvar).toHaveAttribute('aria-disabled', 'true');

  // completar para 11 dígitos torna válido
  await page.getByLabel('Documento').fill('39053344705');
  await expect(page.getByText(/Documento inválido/)).toHaveCount(0);
  await expect(salvar).not.toHaveAttribute('aria-disabled', 'true');
});
