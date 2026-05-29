import type { AppDispatch } from '@/store';
import { createIrpfEntry, deleteIrpfEntry as removeEntry } from '../services/irpfRepo';
import type { IrpfEntryInput } from '../types';

/** Cria um lançamento. A lista reflete via assinatura em tempo real. */
export function saveIrpfEntry(input: IrpfEntryInput) {
  return async (_dispatch: AppDispatch) => {
    await createIrpfEntry(input);
  };
}

/** Remove um lançamento. */
export function deleteIrpfEntry(id: string) {
  return async (_dispatch: AppDispatch) => {
    await removeEntry(id);
  };
}
