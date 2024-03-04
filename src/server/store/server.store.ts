import { Logger } from '@kyrielle/logger';
import { configureStore } from '@reduxjs/toolkit';

import { redirectionsReducer } from './redirections/reducer.js';

export const serverStore = (logger: Logger) => configureStore({
  reducer: {
    redirections: redirectionsReducer(logger),
  }
});
