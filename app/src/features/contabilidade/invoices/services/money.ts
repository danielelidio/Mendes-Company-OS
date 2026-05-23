import type { InvoiceCurrency } from '../types';

// Locale apropriado para a formatação de cada moeda (fallback en-US).
const LOCALE_BY_CURRENCY: Record<InvoiceCurrency, string> = {
  USD: 'en-US',
  BRL: 'pt-BR',
  EUR: 'de-DE',
  GBP: 'en-GB',
};

/** Formata um valor monetário na moeda informada (ex.: 1234.5 + 'USD' → "$1,234.50"). */
export function formatMoney(value: number, currency: InvoiceCurrency): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'en-US';
  return value.toLocaleString(locale, { style: 'currency', currency });
}

/** Converte um texto digitado ("1.234,56" ou "1234.56") em número; NaN → 0. */
export function parseAmount(text: string): number {
  const normalized = text.replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}
