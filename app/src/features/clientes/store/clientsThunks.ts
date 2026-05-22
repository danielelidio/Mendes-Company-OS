import type { AppDispatch } from '@/store';
import { createClient, softDeleteClient, updateClient, type ClientInput } from '../services/clientsRepo';

/** Cria ou atualiza um cliente. A lista reflete via assinatura em tempo real (onSnapshot). */
export function saveClient(input: ClientInput, id?: string) {
  return async (_dispatch: AppDispatch) => {
    if (id) await updateClient(id, input);
    else await createClient(input);
  };
}

/** Soft delete — a lista some via assinatura em tempo real. */
export function deleteClient(id: string) {
  return async (_dispatch: AppDispatch) => {
    await softDeleteClient(id);
  };
}
