import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { InvoiceClientConfig } from '../types';

/** Estado do slice de configuração de invoice por cliente. */
interface InvoiceConfigState {
  /** Configurações indexadas por clientId. */
  byClientId: Record<string, InvoiceClientConfig>;
  /** True até a primeira resposta da assinatura. */
  loading: boolean;
  /** Mensagem de erro da assinatura, se houver. */
  error: string | null;
}

const initialState: InvoiceConfigState = { byClientId: {}, loading: true, error: null };

const invoiceConfigSlice = createSlice({
  name: 'invoiceConfig',
  initialState,
  reducers: {
    /** Alimentado pela assinatura em tempo real (onSnapshot). */
    invoiceConfigsReceived(state, action: PayloadAction<InvoiceClientConfig[]>) {
      state.byClientId = Object.fromEntries(action.payload.map((c) => [c.clientId, c]));
      state.loading = false;
      state.error = null;
    },
    invoiceConfigsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { invoiceConfigsReceived, invoiceConfigsError } = invoiceConfigSlice.actions;
export default invoiceConfigSlice.reducer;
