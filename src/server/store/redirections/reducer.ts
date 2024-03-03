import { Logger, withLabel } from '@kyrielle/logger';
import { createReducer, Reducer } from '@reduxjs/toolkit';

import { loadConfig } from '../actions.ts';
import { disableRedirectionOutput, enableRedirectionOutput } from './actions.ts';
import { RedirectionsState, RedirectionState } from './types.ts';
import { generateRedirectionId } from './utils.ts';

// Reducer
const initialState: RedirectionsState = {
  ids: [],
  byId: {},
};

export function redirectionsReducer(logger: Logger): Reducer<typeof initialState> {
  logger = logger.child(withLabel('redirections'));

  return createReducer(initialState, (builder) => builder
    // Load config
    .addCase(loadConfig, (state, { payload }) => {
      let count = 0;

      for (const [url, config] of Object.entries(payload.redirections)) {
        const id = generateRedirectionId(url);
        const redirection: RedirectionState = {
          id, url,
          outputs: [],
          outputsByName: {},
        };

        for (const [name, output] of Object.entries(config.outputs)) {
          redirection.outputs.push(name);
          redirection.outputsByName[name] = {
            ...output,
            id: `${id}#${name}`,
            name
          };
        }

        state.ids.push(id);
        state.byId[id] = redirection;

        ++count;
        logger.verbose`Loaded ${redirection.url} with ${redirection.outputs.length} outputs (#${id})`;
      }

      logger.verbose`Loaded ${count} redirections from config`;
    })

    // Output management
    .addCase(enableRedirectionOutput, (state, { payload }) => {
      const redirection = state.byId[payload.redirectionId];

      if (redirection) {
        const output = redirection.outputsByName[payload.outputName];

        if (output) {
          output.enabled = true;
          logger.verbose`Output ${payload.outputName} of ${payload.redirectionId} enabled`;
        }
      }
    })
    .addCase(disableRedirectionOutput, (state, { payload }) => {
      const redirection = state.byId[payload.redirectionId];

      if (redirection) {
        const output = redirection.outputsByName[payload.outputName];

        if (output) {
          output.enabled = false;
          logger.verbose`Output ${payload.outputName} of ${payload.redirectionId} disabled`;
        }
      }
    })
  );
}
