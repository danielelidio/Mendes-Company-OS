import reducer, { invoiceConfigsReceived, invoiceConfigsError } from './invoiceConfigSlice';
import type { InvoiceClientConfig } from '../types';

const cfg = (clientId: string): InvoiceClientConfig => ({
  clientId,
  clientCode: 'NP',
  defaultCurrency: 'USD',
  defaultServiceUnit: 'hours',
  defaultTerms: [],
  predefinedServices: [],
  updatedAt: '2026-05-23T00:00:00.000Z',
});

describe('invoiceConfigSlice', () => {
  it('estado inicial: carregando, mapa vazio', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ byClientId: {}, loading: true, error: null });
  });

  it('invoiceConfigsReceived indexa por clientId', () => {
    const state = reducer(undefined, invoiceConfigsReceived([cfg('c1'), cfg('c2')]));
    expect(Object.keys(state.byClientId)).toEqual(['c1', 'c2']);
    expect(state.byClientId.c1.clientId).toBe('c1');
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('invoiceConfigsError registra o erro e encerra o carregamento', () => {
    const state = reducer(undefined, invoiceConfigsError('boom'));
    expect(state.error).toBe('boom');
    expect(state.loading).toBe(false);
  });
});
