import { collection, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { InvoiceClientConfig, InvoiceClientConfigInput, InvoiceCurrency, PredefinedService, ServiceUnit } from '../types';

const COLLECTION = 'invoiceClientConfigs';
const nowIso = () => new Date().toISOString();

/**
 * Termos padrão embutidos por nome de cliente, usados como fallback quando
 * ainda não há configuração salva para o cliente.
 */
export const DEFAULT_TERMS_BY_CLIENT_NAME: Record<string, string[]> = {
  'NPath LLC': ['Payment is due within 15 days'],
};

/** Moeda padrão embutida por nome de cliente (fallback). */
export const DEFAULT_CURRENCY_BY_CLIENT_NAME: Record<string, InvoiceCurrency> = {
  'NPath LLC': 'USD',
};

/** Unidade de serviço padrão embutida por nome de cliente (fallback). */
export const DEFAULT_SERVICE_UNIT_BY_CLIENT_NAME: Record<string, ServiceUnit> = {
  'NPath LLC': 'hours',
};

/** Catálogo de serviços predefinidos embutido por nome de cliente (fallback). */
export const DEFAULT_PREDEFINED_SERVICES_BY_CLIENT_NAME: Record<string, PredefinedService[]> = {
  'NPath LLC': [
    {
      description: 'Horas de Desenvolvimento de Software para o sistema LinOS do cliente Lineage Logistics LLC.',
      unit: 'hours',
      pricePerUnit: 50,
      currency: 'USD',
      autofill: false,
    },
    {
      description: 'On Call Support para o cliente Lineage Logistics LLC.',
      unit: 'hours',
      pricePerUnit: 1.72,
      currency: 'USD',
      autofill: false,
    },
  ],
};

/** Assinatura em tempo real das configurações de invoice (indexadas por clientId). */
export function subscribeInvoiceConfigs(
  onChange: (configs: InvoiceClientConfig[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => onChange(snap.docs.map((d) => d.data() as InvoiceClientConfig)),
    onError,
  );
}

/** Cria/atualiza a configuração de invoice de um cliente (doc id = clientId). */
export async function saveInvoiceConfig(clientId: string, input: InvoiceClientConfigInput): Promise<void> {
  const config: InvoiceClientConfig = {
    clientId,
    clientCode: input.clientCode.trim().toUpperCase(),
    defaultCurrency: input.defaultCurrency,
    defaultServiceUnit: input.defaultServiceUnit,
    defaultTerms: input.defaultTerms.map((t) => t.trim()).filter(Boolean),
    predefinedServices: input.predefinedServices
      .map((s) => ({ ...s, description: s.description.trim() }))
      .filter((s) => s.description !== ''),
    updatedAt: nowIso(),
  };
  await setDoc(doc(db, COLLECTION, clientId), config);
}

/** Código de cliente configurado (vazio quando não há configuração). */
export function resolveClientCode(config: InvoiceClientConfig | undefined): string {
  return config?.clientCode ?? '';
}

/**
 * Termos padrão de um cliente: usa a configuração salva quando existir
 * (mesmo que vazia — preferência explícita), senão o fallback embutido por nome.
 */
export function resolveDefaultTerms(clientName: string | null, config: InvoiceClientConfig | undefined): string[] {
  if (config) return config.defaultTerms ?? [];
  return (clientName && DEFAULT_TERMS_BY_CLIENT_NAME[clientName]) || [];
}

/** Moeda padrão do cliente (configuração salva, senão fallback por nome, senão USD). */
export function resolveDefaultCurrency(clientName: string | null, config: InvoiceClientConfig | undefined): InvoiceCurrency {
  return config?.defaultCurrency ?? (clientName ? DEFAULT_CURRENCY_BY_CLIENT_NAME[clientName] : undefined) ?? 'USD';
}

/** Unidade de serviço padrão do cliente (configuração salva, senão fallback por nome, senão `unit`). */
export function resolveDefaultServiceUnit(clientName: string | null, config: InvoiceClientConfig | undefined): ServiceUnit {
  return config?.defaultServiceUnit ?? (clientName ? DEFAULT_SERVICE_UNIT_BY_CLIENT_NAME[clientName] : undefined) ?? 'unit';
}

/** Serviços predefinidos do cliente (configuração salva, senão fallback por nome, senão vazio). */
export function resolvePredefinedServices(clientName: string | null, config: InvoiceClientConfig | undefined): PredefinedService[] {
  if (config) return config.predefinedServices ?? [];
  return (clientName && DEFAULT_PREDEFINED_SERVICES_BY_CLIENT_NAME[clientName]) || [];
}
