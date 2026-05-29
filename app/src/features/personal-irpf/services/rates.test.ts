import { convertToBrl, rateFor, rateForMonth } from './rates';
import { RATES } from '../data/rates';

describe('rateForMonth', () => {
  it('lê a taxa de um mês publicado', () => {
    const r = rateForMonth('2025-01-15');
    expect(r).toEqual(RATES[2025][1]);
  });

  it('null para meses sem publicação (ex.: 2026-12)', () => {
    expect(rateForMonth('2026-12-01')).toBeNull();
  });

  it('null para datas inválidas', () => {
    expect(rateForMonth('xx')).toBeNull();
  });
});

describe('rateFor', () => {
  it('income usa COMPRA; expense usa VENDA', () => {
    const m = RATES[2025][3];
    expect(rateFor('2025-03-10', 'income')).toBe(m.compra);
    expect(rateFor('2025-03-10', 'expense')).toBe(m.venda);
  });
});

describe('convertToBrl', () => {
  it('multiplica USD pela taxa e arredonda para 2 casas', () => {
    const out = convertToBrl(100, '2025-01-15', 'income'); // 100 * 6.0394 = 603.94
    expect(out?.rate).toBe(RATES[2025][1].compra);
    expect(out?.brl).toBe(603.94);
  });

  it('null quando a taxa do mês não foi publicada', () => {
    expect(convertToBrl(100, '2026-12-15', 'income')).toBeNull();
  });
});
