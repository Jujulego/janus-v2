import { serverStore } from './server.store.js';

// Types
export type ServerStore = ReturnType<typeof serverStore>;
export type ServerDispatch = ServerStore['dispatch'];
