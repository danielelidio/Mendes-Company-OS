import { test, expect, type Page } from '@playwright/test';
import { login, SAMPLE_INVOICE_PDF } from './support';

/** Cria um cliente (só nome) pela UI e volta para a lista. */
async function novoCliente(page: Page, nome: string) {
  await page.goto('/clientes/novo');
  await page.getByLabel('Nome').fill(nome);
  await page.getByText('Salvar', { exact: true }).click();
  await expect(page).toHaveURL(/\/clientes$/);
  await expect(page.getByText(nome)).toBeVisible();
}

/** Seleciona um cliente no SearchableSelect do formulário de invoice. */
async function selecionarCliente(page: Page, nome: string) {
  await page.getByText('Selecione um cliente', { exact: true }).click();
  await page.getByPlaceholder('Buscar…').fill(nome);
  await page.getByText(nome, { exact: true }).click();
}

test('cria invoice: configura cliente + serviço predefinido pelo modal e usa o combobox', async ({ page }) => {
  await login(page);
  const cliente = `Invoice Co ${Date.now()}`;
  await novoCliente(page, cliente);

  await page.goto('/contabilidade/invoices/novo');

  // Selecionar o cliente sem configuração abre o modal de configuração na própria página.
  await selecionarCliente(page, cliente);
  await expect(page.getByText('Configurar cliente')).toBeVisible();

  const modal = page.getByTestId('invoice-config-modal');
  await modal.getByLabel('Código do cliente (2 caracteres)').fill('EE');

  // Cadastra um serviço predefinido (preço $50.00 = digitar "5000"); autofill desmarcado por padrão.
  await modal.getByText('Adicionar serviço').click();
  await modal.getByPlaceholder('Descrição').fill('Consultoria E2E');
  await modal.getByLabel('Preço/un.').fill('5000');

  // Termo padrão (prefill nos termos da invoice).
  await modal.getByText('Adicionar termo').click();
  await modal.getByPlaceholder('Termo ou condição').fill('Payment is due within 30 days');

  await modal.getByText('Salvar configuração', { exact: true }).click();
  await expect(modal).toHaveCount(0); // aguarda o modal fechar após salvar

  // Serviço sem autofill NÃO entra automaticamente na invoice.
  await expect(page.getByText('Nenhum serviço adicionado ainda.')).toBeVisible();

  await page.getByLabel('Data da invoice').fill('2026-05-22');
  await page.getByLabel('Serviço de').fill('2026-05-01');
  await page.getByLabel('Serviço até').fill('2026-05-31');

  // Adiciona um serviço e escolhe o predefinido pelo combobox (preenche descrição + preço formatado).
  await page.getByText('Adicionar serviço').click();
  await page.getByPlaceholder('Descrição').fill('Consult');
  await page.getByText('Consultoria E2E', { exact: true }).click();
  await expect(page.getByLabel('Preço/un.')).toHaveValue('$50.00');

  const chooser = page.waitForEvent('filechooser');
  await page.getByText('Anexar PDF').click();
  await (await chooser).setFiles(SAMPLE_INVOICE_PDF);

  await expect(page.getByText('EE-001-2026-05')).toBeVisible();
  await page.getByText('Salvar', { exact: true }).click();
  await expect(page).toHaveURL(/\/contabilidade\/invoices$/);
  await expect(page.getByText('EE-001-2026-05')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Excluir EE-001-2026-05').click();
  await expect(page.getByText('EE-001-2026-05')).toHaveCount(0);
});

test('serviço com Autofill entra pré-preenchido ao criar a invoice', async ({ page }) => {
  await login(page);
  const cliente = `Autofill Co ${Date.now()}`;
  await novoCliente(page, cliente);

  await page.goto('/contabilidade/invoices/novo');
  await selecionarCliente(page, cliente);

  const modal = page.getByTestId('invoice-config-modal');
  await modal.getByLabel('Código do cliente (2 caracteres)').fill('AF');
  await modal.getByText('Adicionar serviço').click();
  await modal.getByPlaceholder('Descrição').fill('Serviço Autofill');
  await modal.getByLabel('Preço/un.').fill('5000');
  await modal.getByLabel(/Preencher automaticamente/).click(); // marca Autofill
  await modal.getByText('Salvar configuração', { exact: true }).click();
  await expect(modal).toHaveCount(0);

  // O serviço com autofill já entra pré-preenchido na invoice.
  await expect(page.getByLabel('Descrição')).toHaveValue('Serviço Autofill');
});

test('campos obrigatórios: Save desabilitado e modal abre para cliente sem código', async ({ page }) => {
  await login(page);
  const cliente = `Sem Codigo ${Date.now()}`;
  await novoCliente(page, cliente);

  await page.goto('/contabilidade/invoices/novo');

  const salvar = page.getByText('Salvar', { exact: true }).locator('..');
  await expect(salvar).toHaveAttribute('aria-disabled', 'true'); // form vazio é inválido

  await selecionarCliente(page, cliente);
  // Cliente sem código: modal de configuração aparece automaticamente.
  await expect(page.getByText('Configurar cliente')).toBeVisible();

  // Fechar sem configurar mantém o aviso e o Save desabilitado.
  await page.getByText('Depois').click();
  await expect(page.getByText(/Defina um código de 2 caracteres/)).toBeVisible();
  await expect(salvar).toHaveAttribute('aria-disabled', 'true');
});
