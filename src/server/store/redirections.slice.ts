import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createHash } from 'node:crypto';

import { Config } from '../../config/type.js';

// Types
export interface OutputState {
  name: string;
  target: string;
  enabled: boolean;
  changeOrigin: boolean;
  secure: boolean;
  ws: boolean;
}

export interface RedirectionState {
  id: string;
  url: string;
  outputs: string[];
  outputsByName: Record<string, OutputState>;
}

// Slice
const initialState: Record<string, RedirectionState> = {};

const redirectionsSlice = createSlice({
  name: 'redirections',
  initialState,
  reducers: {
    loadConfig(state, action: PayloadAction<Config>) {
      for (const [url, config] of Object.entries(action.payload.redirections)) {
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
            name
          };
        }

        state[id] = redirection;
      }
    },
    enableRedirectionOutput(state, action: PayloadAction<{ redirectionId: string, outputName: string }>) {
      const redirection = state[action.payload.redirectionId];

      if (redirection) {
        const output = redirection.outputsByName[action.payload.outputName];

        if (output) {
          output.enabled = true;
        }
      }
    },
    disableRedirectionOutput(state, action: PayloadAction<{ redirectionId: string, outputName: string }>) {
      const redirection = state[action.payload.redirectionId];

      if (redirection) {
        const output = redirection.outputsByName[action.payload.outputName];

        if (output) {
          output.enabled = false;
        }
      }
    }
  }
});

export const { loadConfig, enableRedirectionOutput, disableRedirectionOutput } = redirectionsSlice.actions;
export const redirectionsReducer = redirectionsSlice.reducer;

// Utils
function generateRedirectionId(url: string): string {
  const hash = createHash('md5');
  hash.update(url);

  return hash.digest().toString('base64url');
}