import { collection, deleteDoc, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Platform } from 'react-native';
import type * as DocumentPicker from 'expo-document-picker';
import { db, storage } from '@/lib/firebase';
import type { Invoice, InvoiceCurrency, InvoiceService } from '../types';

/** Nome da coleção do Firestore onde ficam as invoices. */
const COLLECTION = 'invoices';
/** Timestamp ISO atual. */
const nowIso = () => new Date().toISOString();
/** Gera um id de documento novo (sem gravar). */
const newId = () => doc(collection(db, COLLECTION)).id;

/** Saneia um texto para uso seguro em caminho do Storage (mantém letras/dígitos/`.`/`-`). */
function sanitize(value: string): string {
  return value.normalize('NFD').replace(/[^\w.-]+/g, '_').replace(/^_+|_+$/g, '') || 'invoice';
}

/** Dados editáveis de uma invoice (sem id, timestamps e campos do arquivo). */
export interface InvoiceInput {
  /** Cliente da invoice (id no Firestore) ou null. */
  clientId: string | null;
  /** Nome do cliente, desnormalizado para a tabela. */
  clientName: string | null;
  /** Número da invoice (`{código}-{seq3}-{ano}-{mês}`). */
  number: string;
  /** Sequência incremental por cliente usada para compor o número. */
  sequence: number;
  /** Data da invoice (ISO `YYYY-MM-DD`) ou null. */
  date: string | null;
  /** Início do período de serviço (ISO `YYYY-MM-DD`) ou null. */
  serviceFrom: string | null;
  /** Fim do período de serviço (ISO `YYYY-MM-DD`) ou null. */
  serviceTo: string | null;
  /** Moeda dos valores. */
  currency: InvoiceCurrency;
  /** Itens de serviço. */
  services: InvoiceService[];
  /** Total (soma dos subtotais). */
  total: number;
  /** Lista de observações. */
  observations: string[];
  /** Lista de termos e condições. */
  termsAndConditions: string[];
}

/** Assinatura em tempo real das invoices (ordenadas por data desc, depois número). */
export function subscribeInvoices(
  onChange: (invoices: Invoice[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const rows = snap.docs.map((d) => d.data() as Invoice);
      rows.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.number.localeCompare(a.number));
      onChange(rows);
    },
    onError,
  );
}

/** Cria uma invoice (sem arquivo). Retorna o registro criado (com id). */
export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  const id = newId();
  const now = nowIso();
  const invoice: Invoice = {
    id,
    ...input,
    fileName: null,
    storagePath: null,
    downloadURL: null,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, COLLECTION, id), invoice);
  return invoice;
}

/** Atualiza os campos editáveis de uma invoice. */
export async function updateInvoice(id: string, input: InvoiceInput): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input, updatedAt: nowIso() });
}

/** Remove a invoice e o PDF anexado (se houver). */
export async function deleteInvoice(id: string, storagePath: string | null): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
  if (storagePath) {
    try {
      await deleteObject(ref(storage, storagePath));
    } catch {
      // O arquivo pode já não existir — ignora.
    }
  }
}

/** Lê o arquivo escolhido como Blob (no web usa o File; no native, busca pela URI). */
async function assetToBlob(asset: DocumentPicker.DocumentPickerAsset): Promise<Blob> {
  const webFile = (asset as unknown as { file?: File }).file;
  if (Platform.OS === 'web' && webFile) return webFile;
  const res = await fetch(asset.uri);
  return res.blob();
}

/** Faz upload do PDF para o Storage e grava os campos do arquivo na invoice. */
export async function uploadInvoicePdf(
  id: string,
  number: string,
  asset: DocumentPicker.DocumentPickerAsset,
): Promise<void> {
  const safeFile = `${sanitize((asset.name ?? 'invoice').replace(/\.pdf$/i, ''))}.pdf`;
  const storagePath = `contabilidade/invoices/${sanitize(number || id)}/${safeFile}`;
  const storageRef = ref(storage, storagePath);
  await uploadBytes(storageRef, await assetToBlob(asset), { contentType: 'application/pdf' });
  const downloadURL = await getDownloadURL(storageRef);
  await updateDoc(doc(db, COLLECTION, id), {
    fileName: asset.name ?? safeFile,
    storagePath,
    downloadURL,
    updatedAt: nowIso(),
  });
}
