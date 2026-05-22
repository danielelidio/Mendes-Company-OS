// Common BACEN currency codes (tpMoeda) → ISO / symbol. Unknown codes fall back to the raw code.
const BACEN: Record<string, { iso: string; symbol: string }> = {
  '220': { iso: 'USD', symbol: 'US$' },
  '978': { iso: 'EUR', symbol: '€' },
  '540': { iso: 'GBP', symbol: '£' },
  '470': { iso: 'JPY', symbol: '¥' },
  '165': { iso: 'CAD', symbol: 'CA$' },
  '425': { iso: 'CHF', symbol: 'CHF' },
  '595': { iso: 'AUD', symbol: 'A$' },
};

/** Formats a foreign-currency value (e.g. "US$ 8.950,00"), or null when there's no foreign value. */
export function formatForeignValue(value: number | null | undefined, code: string | null | undefined): string | null {
  if (value == null || !code) return null;
  const amount = value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const c = BACEN[code];
  return c ? `${c.symbol} ${amount}` : `${code} ${amount}`;
}
