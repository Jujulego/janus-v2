import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface OutputState {
  id: string;
  name: string;
  target: string;
  enabled: boolean;
  changeOrigin: boolean;
  secure: boolean;
  ws: boolean;
}

// Slice
const initialState: Record<string, OutputState> = {};

const outputsSlice = createSlice({
  name: 'outputs',
  initialState,
  reducers: {
    putOutput(state, action: PayloadAction<OutputState>) {
      state[action.payload.id] = action.payload;
    },
    enableOutput(state, action: PayloadAction<string>) {
      if (state[action.payload]) {
        state[action.payload]!.enabled = true;
      }
    },
    disableOutput(state, action: PayloadAction<string>) {
      if (state[action.payload]) {
        state[action.payload]!.enabled = false;
      }
    }
  }
});

export const { putOutput, enableOutput, disableOutput } = outputsSlice.actions;
export const outputsReducer = outputsSlice.reducer;