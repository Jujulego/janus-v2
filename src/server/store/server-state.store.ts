import { configureStore } from '@reduxjs/toolkit';

import { outputsReducer } from './outputs.slice.ts';
import { redirectionsReducer } from './redirections.slice.ts';

export const ServerStateStore = () => configureStore({
  reducer: {
    outputs: outputsReducer,
    redirections: redirectionsReducer,
  }
});