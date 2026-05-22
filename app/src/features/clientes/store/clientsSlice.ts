import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Client } from '../types';

interface ClientsState {
  items: Client[];
  loading: boolean;
  error: string | null;
}

const initialState: ClientsState = { items: [], loading: true, error: null };

const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    // Alimentado pela assinatura em tempo real (onSnapshot) — entrega a lista completa.
    clientsReceived(state, action: PayloadAction<Client[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    clientsError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { clientsReceived, clientsError } = clientsSlice.actions;
export default clientsSlice.reducer;
