import type * as DocumentPicker from 'expo-document-picker';
import type { AppDispatch } from '@/store';
import {
  createInvoice,
  deleteInvoice as removeInvoice,
  updateInvoice,
  uploadInvoicePdf,
  type InvoiceInput,
} from '../services/invoicesRepo';

/**
 * Cria ou atualiza uma invoice e, se um PDF foi escolhido, faz upload e o vincula.
 * A lista reflete automaticamente via assinatura em tempo real.
 */
export function saveInvoice(
  input: InvoiceInput,
  id: string | undefined,
  pdf: DocumentPicker.DocumentPickerAsset | null,
) {
  return async (_dispatch: AppDispatch) => {
    let invoiceId = id;
    if (invoiceId) {
      await updateInvoice(invoiceId, input);
    } else {
      const created = await createInvoice(input);
      invoiceId = created.id;
    }
    if (pdf) await uploadInvoicePdf(invoiceId, input.number, pdf);
  };
}

/** Remove a invoice (e o PDF anexado). */
export function deleteInvoice(id: string, storagePath: string | null) {
  return async (_dispatch: AppDispatch) => {
    await removeInvoice(id, storagePath);
  };
}
