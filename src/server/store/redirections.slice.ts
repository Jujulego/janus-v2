import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface RedirectionState {
  id: string;
  url: string;
  outputs: string[];
}

// Slice
const initialState: Record<string, RedirectionState> = {};

const redirectionsSlice = createSlice({
  name: 'redirections',
  initialState,
  reducers: {
    putRedirection(state, action: PayloadAction<RedirectionState>) {
      state[action.payload.id] = action.payload;
    }
  }
});

export const { putRedirection } = redirectionsSlice.actions;
export const redirectionsReducer = redirectionsSlice.reducer;