import { collection, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Client, ParsedClient } from '../types';
import { normalizeName, rankBySimilarity, SIMILARITY_THRESHOLD, type ClientMatch } from './clientMatching';
import { normalizeDocument } from './documentFormat';

const COLLECTION = 'clients';

const nowIso = () => new Date().toISOString();
const newId = () => doc(collection(db, COLLECTION)).id;

export interface ClientInput {
  name: string;
  documentType: Client['documentType'];
  document: string | null;
  address: Client['address'];
}

/** Non-deleted clients (sorted by name). Pass includeDeleted to get everything. */
export async function listClients(includeDeleted = false): Promise<Client[]> {
  const snap = await getDocs(collection(db, COLLECTION));
  return snap.docs
    .map((d) => d.data() as Client)
    .filter((c) => includeDeleted || !c.deleted)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Assinatura em tempo real dos clientes não-deletados (ordenados por nome).
 * Dispara `onChange` a cada criação/edição/soft-delete. Retorna a função para cancelar.
 */
export function subscribeClients(
  onChange: (clients: Client[]) => void,
  onError: (error: Error) => void,
): () => void {
  return onSnapshot(
    collection(db, COLLECTION),
    (snap) => {
      const rows = snap.docs
        .map((d) => d.data() as Client)
        .filter((c) => !c.deleted)
        .sort((a, b) => a.name.localeCompare(b.name));
      onChange(rows);
    },
    onError,
  );
}

export async function getClient(id: string): Promise<Client | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? (snap.data() as Client) : null;
}

export async function createClient(input: ClientInput): Promise<Client> {
  const id = newId();
  const now = nowIso();
  const client: Client = { id, ...input, deleted: false, deletedAt: null, createdAt: now, updatedAt: now };
  await setDoc(doc(db, COLLECTION, id), client);
  return client;
}

export function createClientFromParsed(p: ParsedClient): Promise<Client> {
  return createClient({
    name: p.name ?? 'Sem nome',
    documentType: p.documentType,
    document: p.document,
    address: p.address,
  });
}

export async function updateClient(id: string, input: ClientInput): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { ...input, updatedAt: nowIso() });
}

/** Soft delete — flags the record, keeps it in the collection. */
export async function softDeleteClient(id: string): Promise<void> {
  const now = nowIso();
  await updateDoc(doc(db, COLLECTION, id), { deleted: true, deletedAt: now, updatedAt: now });
}

/** Exact match by document, else by identical normalized name. */
export function findExactClient(p: ParsedClient, clients: Client[]): Client | null {
  const pDoc = normalizeDocument(p.document);
  if (pDoc) {
    const byDoc = clients.find((c) => normalizeDocument(c.document) === pDoc);
    if (byDoc) return byDoc;
  }
  if (p.name) {
    const target = normalizeName(p.name);
    const byName = clients.find((c) => normalizeName(c.name) === target);
    if (byName) return byName;
  }
  return null;
}

/** Similar-but-not-exact clients above the threshold, ranked (highest first). */
export function findSimilarClients(name: string | null, clients: Client[]): ClientMatch[] {
  return rankBySimilarity(name, clients).filter((m) => m.score >= SIMILARITY_THRESHOLD && m.score < 1);
}
