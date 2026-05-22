import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadString } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { NotaFiscalRecord, ParsedNotaFiscal } from '../types';

const COLLECTION = 'notasFiscais';

function sanitize(value: string): string {
  return (
    value
      .normalize('NFD')
      .replace(/[^\w.-]+/g, '_')
      .replace(/^_+|_+$/g, '') || 'sem-numero'
  );
}

/** Deterministic Firestore id for a nota: `{source}_{numero}`. */
function notaFiscalId(parsed: ParsedNotaFiscal): string {
  return `${parsed.source}_${sanitize(parsed.numero || 'sem-numero')}`;
}

/** True if a nota with the same source + número was already imported. */
export async function notaFiscalExists(parsed: ParsedNotaFiscal): Promise<boolean> {
  const snap = await getDoc(doc(db, COLLECTION, notaFiscalId(parsed)));
  return snap.exists();
}

/**
 * Stores the XML under contabilidade/notas-fiscais/{numero}/ in Cloud Storage and
 * saves the extracted fields (with the resolved clientId) to Firestore.
 */
export async function saveNotaFiscal(
  fileName: string,
  xml: string,
  parsed: ParsedNotaFiscal,
  clientId: string | null,
): Promise<NotaFiscalRecord> {
  const numero = parsed.numero || 'sem-numero';
  const safeNumero = sanitize(numero);
  const safeFile = `${sanitize(fileName.replace(/\.xml$/i, ''))}.xml`;
  const storagePath = `contabilidade/notas-fiscais/${safeNumero}/${safeFile}`;

  const storageRef = ref(storage, storagePath);
  await uploadString(storageRef, xml, 'raw', { contentType: 'application/xml' });
  const downloadURL = await getDownloadURL(storageRef);

  const id = notaFiscalId(parsed);
  const record: NotaFiscalRecord = {
    id,
    numero: parsed.numero,
    competencia: parsed.competencia,
    valor: parsed.valor,
    valorMoeda: parsed.valorMoeda,
    moeda: parsed.moeda,
    status: parsed.status,
    source: parsed.source,
    cliente: parsed.cliente.name,
    clientId,
    fileName,
    storagePath,
    downloadURL,
    uploadedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, COLLECTION, id), record);
  return record;
}

export async function listNotasFiscais(): Promise<NotaFiscalRecord[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  const rows = snap.docs.map((d) => d.data() as NotaFiscalRecord);
  return rows.sort((a, b) => {
    const byCompetencia = (b.competencia ?? '').localeCompare(a.competencia ?? '');
    return byCompetencia !== 0 ? byCompetencia : b.numero.localeCompare(a.numero);
  });
}

/**
 * Assinatura em tempo real da coleção. Dispara `onChange` a cada alteração
 * (criação durante o upload, exclusão, etc.). Retorna a função para cancelar.
 */
export function subscribeNotasFiscais(
  onChange: (rows: NotaFiscalRecord[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => onChange(snap.docs.map((d) => d.data() as NotaFiscalRecord)),
    onError,
  );
}

/** Hard delete: removes the Firestore record and the stored XML file. */
export async function deleteNotaFiscal(id: string, storagePath: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // The stored file may already be gone — ignore.
  }
}

/** Deletes every Nota Fiscal record and its stored XML. Returns how many were removed. */
export async function deleteAllNotasFiscais(): Promise<number> {
  const all = await listNotasFiscais();
  await Promise.all(all.map((n) => deleteNotaFiscal(n.id, n.storagePath)));
  return all.length;
}
