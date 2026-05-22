import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/** Forma serializável do usuário (o objeto User do Firebase não vai para o store). */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthState {
  user: AuthUser | null;
  initializing: boolean;
}

const initialState: AuthState = { user: null, initializing: true };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Disparado pelo listener do Firebase a cada mudança de sessão.
    authResolved(state, action: PayloadAction<AuthUser | null>) {
      state.user = action.payload;
      state.initializing = false;
    },
  },
});

export const { authResolved } = authSlice.actions;
export default authSlice.reducer;
