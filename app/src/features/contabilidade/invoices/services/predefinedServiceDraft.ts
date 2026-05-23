import type { InvoiceCurrency, PredefinedService, ServiceUnit } from '../types';

/** Serviço predefinido em edição na tela/modal de configuração. */
export type PredefinedServiceDraft = {
  /** Descrição do serviço. */
  description: string;
  /** Unidade de cobrança. */
  unit: ServiceUnit;
  /** Preço por unidade. */
  pricePerUnit: number;
  /** Moeda do preço por unidade. */
  currency: InvoiceCurrency;
  /** Se entra pré-preenchido em novas invoices do cliente. */
  autofill: boolean;
};

/**
 * Converte serviços predefinidos persistidos em rascunhos editáveis.
 * @param services Serviços vindos da configuração salva.
 * @returns Rascunhos prontos para edição no formulário.
 */
export const toServiceDrafts = (services: PredefinedService[]): PredefinedServiceDraft[] =>
  services.map((s) => ({
    description: s.description,
    unit: s.unit,
    pricePerUnit: s.pricePerUnit,
    currency: s.currency,
    autofill: Boolean(s.autofill),
  }));

/**
 * Converte rascunhos em serviços predefinidos para persistir, descartando os
 * que ficaram sem descrição (trim).
 * @param drafts Rascunhos editados no formulário.
 * @returns Serviços prontos para salvar.
 */
export const fromServiceDrafts = (drafts: PredefinedServiceDraft[]): PredefinedService[] =>
  drafts
    .map((d) => ({
      description: d.description.trim(),
      unit: d.unit,
      pricePerUnit: d.pricePerUnit,
      currency: d.currency,
      autofill: d.autofill,
    }))
    .filter((s) => s.description !== '');
