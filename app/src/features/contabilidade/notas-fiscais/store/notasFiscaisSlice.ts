import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NotaFiscalRecord } from '../types';

interface NotasFiscaisState {
  items: NotaFiscalRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: NotasFiscaisState = { items: [], loading: true, error: null };

const notasFiscaisSlice = createSlice({
  name: 'notasFiscais',
  initialState,
  reducers: {
    // Alimentado pela assinatura em tempo real (onSnapshot) — entrega a lista completa.
    notasReceived(state, action: PayloadAction<NotaFiscalRecord[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    notasError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { notasReceived, notasError } = notasFiscaisSlice.actions;
export default notasFiscaisSlice.reducer;
