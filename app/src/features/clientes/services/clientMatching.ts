import type { Client } from '../types';

/** Threshold above which a client name is considered "similar enough" to prompt manual matching. */
export const SIMILARITY_THRESHOLD = 0.6;

export function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 0; i < a.length; i++) {
    const curr = [i + 1];
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      curr[j + 1] = Math.min(curr[j] + 1, prev[j + 1] + 1, prev[j] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

/** 0..1 similarity between two names (normalized Levenshtein ratio). */
export function nameSimilarity(a: string | null, b: string | null): number {
  const na = normalizeName(a ?? '');
  const nb = normalizeName(b ?? '');
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  return 1 - levenshtein(na, nb) / Math.max(na.length, nb.length);
}

export interface ClientMatch {
  client: Client;
  score: number;
}

/** Clients ranked by name similarity (highest first). */
export function rankBySimilarity(name: string | null, clients: Client[]): ClientMatch[] {
  return clients
    .map((client) => ({ client, score: nameSimilarity(name, client.name) }))
    .sort((a, b) => b.score - a.score);
}
