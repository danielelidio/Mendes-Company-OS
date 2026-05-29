import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { IrpfEntry } from '../types';

/** Estado do slice de lançamentos pessoais de IRPF. */
interface IrpfState {
  items: IrpfEntry[];
  loading: boolean;
  error: string | null;
}

const initialState: IrpfState = { items: [], loading: true, error: null };

const irpfSlice = createSlice({
  name: 'irpf',
  initialState,
  reducers: {
    /** Alimentado pela assinatura em tempo real (onSnapshot). */
    irpfReceived(state, action: PayloadAction<IrpfEntry[]>) {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    irpfError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { irpfReceived, irpfError } = irpfSlice.actions;
export default irpfSlice.reducer;
