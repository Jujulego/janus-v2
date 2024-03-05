import { createSelector } from '@reduxjs/toolkit';

import { ServerState } from '../types.js';
import { RedirectionState } from './types.js';

/**
 * Returns list of all redirections, in config order
 */
export const allRedirections = createSelector(
  [
    (state: ServerState) => state.redirections.ids,
    (state: ServerState) => state.redirections.byId,
  ],
  (ids, index) => {
    return ids.map((id) => index[id]!);
  }
);

/**
 * Returns list of all redirections, in config order
 */
export const getRedirection = createSelector(
  [
    (_: ServerState, id: string) => id,
    (state: ServerState) => state.redirections.byId,
  ],
  (id, index) => {
    return index[id] ?? null;
  }
);

/**
 * Resolve redirection according to given url
 */
export const resolveRedirection = createSelector(
  [
    allRedirections,
    (_: ServerState, url: string) => url,
  ],
  (redirections, url) => {
    for (const redirection of redirections) {
      if (url.startsWith(redirection.url)) {
        return redirection;
      }
    }

    return null;
  }
);

/**
 * Returns list of all outputs of a redirection
 */
export const listOutputs = createSelector(
  [
    (state: RedirectionState) => state.outputs,
    (state: RedirectionState) => state.outputsByName,
  ],
  (names, index) => {
    return names.map((name) => index[name]!);
  }
);

/**
 * Returns enabled outputs of a redirection
 */
export const listEnabledOutputs = createSelector(
  [listOutputs],
  (outputs) => {
    return outputs.filter((output) => output.enabled);
  }
);
