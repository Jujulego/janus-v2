import { configureStore } from '@reduxjs/toolkit';

import { redirectionsReducer } from './redirections.slice.ts';

export const serverStore = () => configureStore({
  reducer: {
    redirections: redirectionsReducer,
  }
});