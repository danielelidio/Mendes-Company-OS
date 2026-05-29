import { RATES, type MonthlyRate } from '../data/rates';
import type { IrpfType } from '../types';

/** Resolve a taxa mensal (USD↔BRL) para uma data ISO. */
export function rateForMonth(date: string): MonthlyRate | null {
  const m = date.match(/^(\d{4})-(\d{2})/);
  if (!m) return null;
  return RATES[Number(m[1])]?.[Number(m[2])] ?? null;
}

/**
 * Taxa a aplicar conforme o tipo:
 * - receita (rendimento) → COMPRA;
 * - despesa (pagamento) → VENDA.
 * Retorna `null` quando não há taxa publicada para o mês da data.
 */
export function rateFor(date: string, type: IrpfType): number | null {
  const r = rateForMonth(date);
  if (!r) return null;
  return type === 'income' ? r.compra : r.venda;
}

/**
 * Converte USD em BRL pela taxa oficial do mês para o tipo.
 * Arredonda o BRL para 2 casas. Retorna `null` quando a taxa não está disponível.
 */
export function convertToBrl(amountUsd: number, date: string, type: IrpfType): { brl: number; rate: number } | null {
  const rate = rateFor(date, type);
  if (rate == null) return null;
  return { brl: Math.round(amountUsd * rate * 100) / 100, rate };
}
