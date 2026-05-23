jest.mock('@/lib/firebase', () => ({ db: {} }));
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(() => ({})),
  doc: jest.fn(() => 'docRef'),
  onSnapshot: jest.fn(),
  setDoc: jest.fn(() => Promise.resolve()),
}));

import { setDoc } from 'firebase/firestore';
import {
  DEFAULT_TERMS_BY_CLIENT_NAME,
  resolveClientCode,
  resolveDefaultCurrency,
  resolveDefaultServiceUnit,
  resolveDefaultTerms,
  resolvePredefinedServices,
  saveInvoiceConfig,
} from './invoiceConfigRepo';
import type { InvoiceClientConfig } from '../types';

const cfg = (over: Partial<InvoiceClientConfig>): InvoiceClientConfig => ({
  clientId: 'c1',
  clientCode: 'AB',
  defaultCurrency: 'BRL',
  defaultServiceUnit: 'days',
  defaultTerms: [],
  predefinedServices: [],
  updatedAt: '',
  ...over,
});

describe('resolvers de configuração', () => {
  it('resolveClientCode usa o código salvo ou vazio', () => {
    expect(resolveClientCode(undefined)).toBe('');
    expect(resolveClientCode(cfg({ clientCode: 'NP' }))).toBe('NP');
  });

  it('resolveDefaultTerms: config salva tem prioridade; fallback por nome (NPath); senão vazio', () => {
    expect(resolveDefaultTerms(null, undefined)).toEqual([]);
    expect(resolveDefaultTerms('Outro', undefined)).toEqual([]);
    expect(resolveDefaultTerms('NPath LLC', undefined)).toEqual(['Payment is due within 15 days']);
    expect(resolveDefaultTerms('NPath LLC', cfg({ defaultTerms: ['x'] }))).toEqual(['x']);
    // config explícita vazia vence o fallback por nome
    expect(resolveDefaultTerms('NPath LLC', cfg({ defaultTerms: [] }))).toEqual([]);
  });

  it('resolveDefaultCurrency: config, senão fallback por nome, senão USD', () => {
    expect(resolveDefaultCurrency(null, undefined)).toBe('USD');
    expect(resolveDefaultCurrency('NPath LLC', undefined)).toBe('USD');
    expect(resolveDefaultCurrency('Outro', cfg({ defaultCurrency: 'EUR' }))).toBe('EUR');
  });

  it('resolveDefaultServiceUnit: config, senão fallback por nome (NPath=hours), senão unit', () => {
    expect(resolveDefaultServiceUnit(null, undefined)).toBe('unit');
    expect(resolveDefaultServiceUnit('NPath LLC', undefined)).toBe('hours');
    expect(resolveDefaultServiceUnit('Outro', cfg({ defaultServiceUnit: 'days' }))).toBe('days');
  });

  it('resolvePredefinedServices: fallback por nome (NPath tem 2), senão config, senão vazio', () => {
    expect(resolvePredefinedServices('Outro', undefined)).toEqual([]);
    expect(resolvePredefinedServices('NPath LLC', undefined)).toHaveLength(2);
    expect(resolvePredefinedServices('NPath LLC', undefined)[0].pricePerUnit).toBe(50);
    expect(resolvePredefinedServices('NPath LLC', cfg({ predefinedServices: [] }))).toEqual([]);
  });

  it('os defaults embutidos do NPath não vêm marcados como autofill', () => {
    expect(DEFAULT_TERMS_BY_CLIENT_NAME['NPath LLC']).toBeDefined();
    expect(resolvePredefinedServices('NPath LLC', undefined).every((s) => s.autofill === false)).toBe(true);
  });
});

describe('saveInvoiceConfig', () => {
  it('normaliza código (trim/upper), filtra termos vazios e serviços sem descrição', async () => {
    await saveInvoiceConfig('c1', {
      clientCode: ' np ',
      defaultCurrency: 'USD',
      defaultServiceUnit: 'hours',
      defaultTerms: ['  a  ', '   ', 'b'],
      predefinedServices: [
        { description: '  Serviço  ', unit: 'hours', pricePerUnit: 5, currency: 'USD', autofill: true },
        { description: '   ', unit: 'unit', pricePerUnit: 0, currency: 'USD', autofill: false },
      ],
    });

    expect(setDoc).toHaveBeenCalledTimes(1);
    const config = (setDoc as jest.Mock).mock.calls[0][1];
    expect(config.clientId).toBe('c1');
    expect(config.clientCode).toBe('NP');
    expect(config.defaultTerms).toEqual(['a', 'b']);
    expect(config.predefinedServices).toEqual([
      { description: 'Serviço', unit: 'hours', pricePerUnit: 5, currency: 'USD', autofill: true },
    ]);
    expect(typeof config.updatedAt).toBe('string');
  });
});
