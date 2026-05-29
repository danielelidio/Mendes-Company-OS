import reducer, { irpfError, irpfReceived } from './irpfSlice';
import type { IrpfEntry } from '../types';

describe('irpfSlice', () => {
  it('estado inicial: carregando, sem itens', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual({ items: [], loading: true, error: null });
  });

  it('irpfReceived define os itens e encerra o carregamento', () => {
    const s = reducer(undefined, irpfReceived([{ id: 'a' } as IrpfEntry]));
    expect(s.items).toHaveLength(1);
    expect(s.loading).toBe(false);
  });

  it('irpfError registra o erro', () => {
    expect(reducer(undefined, irpfError('x')).error).toBe('x');
  });
});
