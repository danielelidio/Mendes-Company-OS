import type { AppDispatch } from '@/store';
import { saveInvoiceConfig as persistInvoiceConfig } from '../services/invoiceConfigRepo';
import type { InvoiceClientConfigInput } from '../types';

/** Salva a configuração de invoice de um cliente. A tela reflete via assinatura em tempo real. */
export function saveInvoiceConfig(clientId: string, input: InvoiceClientConfigInput) {
  return async (_dispatch: AppDispatch) => {
    await persistInvoiceConfig(clientId, input);
  };
}
