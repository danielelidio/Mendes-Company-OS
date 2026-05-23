import { buildInvoiceNumber, nextSequence } from './invoiceNumber';
import type { Invoice } from '../types';

/** Cria uma Invoice mínima (só os campos usados por nextSequence). */
const inv = (clientId: string, sequence: number) => ({ clientId, sequence }) as Invoice;

describe('buildInvoiceNumber', () => {
  it('compõe {código}-{seq3}-{ano}-{mês} e normaliza o código', () => {
    expect(buildInvoiceNumber('np', 1, '2026-05-22')).toBe('NP-001-2026-05');
    expect(buildInvoiceNumber('EE', 42, '2026-12-01')).toBe('EE-042-2026-12');
    expect(buildInvoiceNumber(' ab ', 7, '2025-01-31')).toBe('AB-007-2025-01');
  });

  it('preenche a sequência com zeros até 3 dígitos e mantém acima disso', () => {
    expect(buildInvoiceNumber('NP', 999, '2026-05-22')).toBe('NP-999-2026-05');
    expect(buildInvoiceNumber('NP', 1234, '2026-05-22')).toBe('NP-1234-2026-05');
  });
});

describe('nextSequence', () => {
  it('começa em 1 quando o cliente não tem invoices', () => {
    expect(nextSequence([], 'c1')).toBe(1);
    expect(nextSequence([inv('c2', 5)], 'c1')).toBe(1);
  });

  it('retorna a maior sequência do cliente + 1', () => {
    const invoices = [inv('c1', 3), inv('c1', 1), inv('c2', 9)];
    expect(nextSequence(invoices, 'c1')).toBe(4);
    expect(nextSequence(invoices, 'c2')).toBe(10);
  });

  it('trata sequência ausente como 0', () => {
    const invoices = [{ clientId: 'c1' } as Invoice, inv('c1', 2)];
    expect(nextSequence(invoices, 'c1')).toBe(3);
  });
});
