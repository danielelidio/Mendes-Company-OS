import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Invoice } from '../types';

/** Estado do slice de invoices. */
interface InvoicesState {
  /** Invoices atuais (alimentadas em tempo real). */
  items: Invoice[];
  /** True até a primeira resposta da assinatura. */
  loading: boolean;
  /** Mensagem de erro da assinatura, se houver. */
  error: string | null;
}

const initialState: InvoicesState = { items: [], loading: true, error: null };

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    /** Alimentado pela assinatura em tempo real (onSnapshot). */
    invoicesReceived(state, action: PayloadAction<Invoice[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    invoicesError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { invoicesReceived, invoicesError } = invoicesSlice.actions;
export default invoicesSlice.reducer;
