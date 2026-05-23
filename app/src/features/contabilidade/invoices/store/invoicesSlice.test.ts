import reducer, { invoicesReceived, invoicesError } from './invoicesSlice';
import type { Invoice } from '../types';

const invoice = { id: 'i1', clientId: 'c1', number: 'NP-001-2026-05' } as Invoice;

describe('invoicesSlice', () => {
  it('estado inicial: carregando, sem itens', () => {
    const state = reducer(undefined, { type: '@@INIT' });
    expect(state).toEqual({ items: [], loading: true, error: null });
  });

  it('invoicesReceived popula os itens e encerra o carregamento', () => {
    const state = reducer(undefined, invoicesReceived([invoice]));
    expect(state.items).toEqual([invoice]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('invoicesReceived limpa um erro anterior', () => {
    const errored = reducer(undefined, invoicesError('falhou'));
    const state = reducer(errored, invoicesReceived([]));
    expect(state.error).toBeNull();
    expect(state.loading).toBe(false);
  });

  it('invoicesError registra o erro e encerra o carregamento', () => {
    const state = reducer(undefined, invoicesError('boom'));
    expect(state.error).toBe('boom');
    expect(state.loading).toBe(false);
  });
});
