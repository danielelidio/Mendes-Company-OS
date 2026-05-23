import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/store/authSlice';
import clientsReducer from '@/features/clientes/store/clientsSlice';
import uploadReducer from '@/features/contabilidade/notas-fiscais/store/uploadSlice';
import notasFiscaisReducer from '@/features/contabilidade/notas-fiscais/store/notasFiscaisSlice';
import invoicesReducer from '@/features/contabilidade/invoices/store/invoicesSlice';
import invoiceConfigReducer from '@/features/contabilidade/invoices/store/invoiceConfigSlice';

// Cada feature contribui com seu próprio slice (definido na pasta da feature).
export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    upload: uploadReducer,
    notasFiscais: notasFiscaisReducer,
    invoices: invoicesReducer,
    invoiceConfig: invoiceConfigReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
