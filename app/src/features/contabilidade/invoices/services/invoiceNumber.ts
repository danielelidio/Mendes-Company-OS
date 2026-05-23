import type { Invoice } from '../types';

/**
 * Compõe o número da invoice no formato `{código}-{seq3}-{ano}-{mês}`.
 * Ex.: code `NP`, sequence `1`, date `2026-05-22` → `NP-001-2026-05`.
 *
 * @param code Código de 2 caracteres do cliente.
 * @param sequence Sequência incremental (preenchida com zeros até 3 dígitos).
 * @param date Data da invoice em ISO `YYYY-MM-DD`.
 */
export function buildInvoiceNumber(code: string, sequence: number, date: string): string {
  const year = date.slice(0, 4);
  const month = date.slice(5, 7);
  return `${code.trim().toUpperCase()}-${String(sequence).padStart(3, '0')}-${year}-${month}`;
}

/** Próxima sequência (1-based) para um cliente: maior sequência existente + 1. */
export function nextSequence(invoices: Invoice[], clientId: string): number {
  const max = invoices
    .filter((i) => i.clientId === clientId)
    .reduce((m, i) => Math.max(m, i.sequence ?? 0), 0);
  return max + 1;
}
