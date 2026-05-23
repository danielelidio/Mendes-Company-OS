import { formatMoney, parseAmount } from './money';

// Normaliza espaços inquebráveis (NBSP) que o Intl insere em algumas locales.
const norm = (s: string) => s.replace(/ /g, ' ');

describe('formatMoney', () => {
  it('formata USD em en-US', () => {
    expect(formatMoney(1234.5, 'USD')).toBe('$1,234.50');
    expect(formatMoney(0, 'USD')).toBe('$0.00');
    expect(formatMoney(50, 'USD')).toBe('$50.00');
    expect(formatMoney(1.72, 'USD')).toBe('$1.72');
  });

  it('formata BRL em pt-BR', () => {
    expect(norm(formatMoney(1234.5, 'BRL'))).toBe('R$ 1.234,50');
  });

  it('formata EUR em de-DE', () => {
    expect(norm(formatMoney(1234.5, 'EUR'))).toBe('1.234,50 €');
  });

  it('formata GBP em en-GB', () => {
    expect(formatMoney(1234.5, 'GBP')).toBe('£1,234.50');
  });
});

describe('parseAmount', () => {
  it('interpreta formato pt-BR (1.234,56)', () => {
    expect(parseAmount('1.234,56')).toBe(1234.56);
  });

  it('interpreta formato en-US (1234.56)', () => {
    expect(parseAmount('1234.56')).toBe(1234.56);
  });

  it('mantém decimais com ponto quando não há milhar', () => {
    expect(parseAmount('1.72')).toBe(1.72);
    expect(parseAmount('50')).toBe(50);
    expect(parseAmount('1,5')).toBe(1.5);
  });

  it('trata pontos de milhar (1.234 → 1234)', () => {
    expect(parseAmount('1.234')).toBe(1234);
  });

  it('texto inválido ou vazio vira 0', () => {
    expect(parseAmount('abc')).toBe(0);
    expect(parseAmount('')).toBe(0);
  });
});
