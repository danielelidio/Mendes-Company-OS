import type { FeatureI18n } from './contract';

/** Namespace para strings compartilhadas (componentes genéricos + navegação). */
export const COMMON_NS = 'common';

const en = {
  search: { placeholder: 'Search…', noResults: 'No results', select: 'Select' },
  nav: { home: 'Home', clients: 'Clients', accounting: 'Accounting', invoices: 'Service Tax Statements' },
  actions: { save: 'Save', cancel: 'Cancel', delete: 'Delete' },
  language: { switch: 'Change language' },
};

const pt: typeof en = {
  search: { placeholder: 'Buscar…', noResults: 'Nenhum resultado', select: 'Selecione' },
  nav: { home: 'Início', clients: 'Clientes', accounting: 'Contabilidade', invoices: 'Notas Fiscais' },
  actions: { save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir' },
  language: { switch: 'Trocar idioma' },
};

/** Contrato i18n do namespace compartilhado. */
export const commonI18n: FeatureI18n = { namespace: COMMON_NS, resources: { en, pt } };
