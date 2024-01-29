import { Logger } from '@jujulego/logger';
import { configureStore } from '@reduxjs/toolkit';

import { redirectionsReducer } from './redirections/reducer.ts';

export const serverStore = (logger: Logger) => configureStore({
  reducer: {
    redirections: redirectionsReducer(logger),
  }
});