import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ClientMatch } from '@/features/clientes/services/clientMatching';

export type UploadResult = { fileName: string; status: 'ok' | 'duplicate' | 'error'; message: string };
export type MatchPrompt = { fileName: string; clientName: string; ranked: ClientMatch[] };

interface UploadState {
  busy: boolean;
  total: number;
  results: UploadResult[];
  error: string | null;
  prompt: MatchPrompt | null;
}

const initialState: UploadState = { busy: false, total: 0, results: [], error: null, prompt: null };

const uploadSlice = createSlice({
  name: 'upload',
  initialState,
  reducers: {
    uploadStarted(state, action: PayloadAction<number>) {
      state.busy = true;
      state.total = action.payload;
      state.results = [];
      state.error = null;
      state.prompt = null;
    },
    resultAdded(state, action: PayloadAction<UploadResult>) {
      state.results.push(action.payload);
    },
    promptShown(state, action: PayloadAction<MatchPrompt>) {
      state.prompt = action.payload;
    },
    promptCleared(state) {
      state.prompt = null;
    },
    uploadFinished(state) {
      state.busy = false;
      state.prompt = null;
    },
    uploadFailed(state, action: PayloadAction<string>) {
      state.busy = false;
      state.error = action.payload;
      state.prompt = null;
    },
  },
});

export const { uploadStarted, resultAdded, promptShown, promptCleared, uploadFinished, uploadFailed } =
  uploadSlice.actions;
export default uploadSlice.reducer;
