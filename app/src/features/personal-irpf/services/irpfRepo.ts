import { collection, deleteDoc, doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { IrpfEntry, IrpfEntryInput } from '../types';

/** Coleção dos lançamentos pessoais de IRPF (exterior). */
const COLLECTION = 'irpfPersonalEntries';
const nowIso = () => new Date().toISOString();
const newId = () => doc(collection(db, COLLECTION)).id;

/** Assinatura em tempo real dos lançamentos (mais recentes primeiro). */
export function subscribeIrpfEntries(
  onChange: (items: IrpfEntry[]) => void,
  onError: (e: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const rows = snap.docs.map((d) => d.data() as IrpfEntry);
      rows.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''));
      onChange(rows);
    },
    onError,
  );
}

/** Cria um lançamento. */
export async function createIrpfEntry(input: IrpfEntryInput): Promise<IrpfEntry> {
  const id = newId();
  const now = nowIso();
  const entry: IrpfEntry = { id, ...input, description: input.description.trim(), createdAt: now, updatedAt: now };
  await setDoc(doc(db, COLLECTION, id), entry);
  return entry;
}

/** Remove um lançamento. */
export async function deleteIrpfEntry(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
