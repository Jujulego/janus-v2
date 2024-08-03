import type { serverStore } from './server.store.js';

// Types
export type ServerStore = ReturnType<typeof serverStore>;
export type ServerState = ReturnType<ServerStore['getState']>;
export type ServerDispatch = ServerStore['dispatch'];
