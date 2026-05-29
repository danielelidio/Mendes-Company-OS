import type { FeatureI18n } from '@/i18n/contract';

/** Namespace i18n do IRPF pessoal (exterior). */
export const IRPF_NS = 'irpf';

const en = {
  title: "Genevieve's IRPF 2025/2026",
  subtitle: 'Personal income and expenses abroad — converted to BRL with the Receita Federal monthly rates.',
  add: 'Add',
  empty: 'No entries yet. Click "Add" to create one.',
  headers: {
    date: 'Date',
    type: 'Type',
    category: 'Category',
    description: 'Description',
    amountUsd: 'Amount (USD)',
    amountBrl: 'Amount (BRL)',
    rate: 'Rate',
    actions: 'Actions',
  },
  types: { income: 'Income', expense: 'Expense' },
  categories: { payment: 'Payment', donation: 'Donation', general: 'General' },
  modal: {
    title: 'New entry',
    date: 'Date',
    type: 'Type',
    category: 'Category',
    categoryPlaceholder: 'Select a category',
    amountUsd: 'Amount in USD',
    description: 'Description',
    descriptionPlaceholder: 'What is this transaction?',
    rateLine: 'Rate {{rate}} (Receita Federal — {{kind}})',
    rateKindCompra: 'compra',
    rateKindVenda: 'venda',
    convertedTo: 'Converts to',
    noRate: 'No official rate published for this month yet — save is disabled.',
    cancel: 'Cancel',
    save: 'Save',
  },
  confirmDelete: 'Delete this entry?',
  deleteAria: 'Delete entry',
  validation: {
    dateRequired: 'Enter a date.',
    amountRequired: 'Enter an amount greater than zero.',
    descriptionRequired: 'Enter a description.',
  },
};

const pt: typeof en = {
  title: 'IRPF 2025/2026 — Genevieve',
  subtitle: 'Rendimentos e pagamentos pessoais no exterior — convertidos para BRL pelas taxas mensais da Receita Federal.',
  add: 'Adicionar',
  empty: 'Nenhum lançamento ainda. Clique em "Adicionar" para criar.',
  headers: {
    date: 'Data',
    type: 'Tipo',
    category: 'Categoria',
    description: 'Descrição',
    amountUsd: 'Valor (USD)',
    amountBrl: 'Valor (BRL)',
    rate: 'Taxa',
    actions: 'Ações',
  },
  types: { income: 'Receita', expense: 'Despesa' },
  categories: { payment: 'Pagamento', donation: 'Doação', general: 'Geral' },
  modal: {
    title: 'Novo lançamento',
    date: 'Data',
    type: 'Tipo',
    category: 'Categoria',
    categoryPlaceholder: 'Selecione uma categoria',
    amountUsd: 'Valor em USD',
    description: 'Descrição',
    descriptionPlaceholder: 'Do que se trata este lançamento?',
    rateLine: 'Taxa {{rate}} (Receita Federal — {{kind}})',
    rateKindCompra: 'compra',
    rateKindVenda: 'venda',
    convertedTo: 'Converte para',
    noRate: 'Ainda não há taxa oficial publicada para este mês — não é possível salvar.',
    cancel: 'Cancelar',
    save: 'Salvar',
  },
  confirmDelete: 'Excluir este lançamento?',
  deleteAria: 'Excluir lançamento',
  validation: {
    dateRequired: 'Informe uma data.',
    amountRequired: 'Informe um valor maior que zero.',
    descriptionRequired: 'Informe uma descrição.',
  },
};

/** Contrato i18n da feature `irpf` (pronto para virar pacote). */
export const irpfI18n: FeatureI18n = { namespace: IRPF_NS, resources: { en, pt } };
