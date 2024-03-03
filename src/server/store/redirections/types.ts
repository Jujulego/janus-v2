import { RedirectionOutput } from '../../../types/redirection.js';

// Types
export interface RedirectionState {
  id: string;
  url: string;
  outputs: string[];
  outputsByName: Record<string, RedirectionOutput>;
}

export interface RedirectionsState {
  ids: string[];
  byId: Record<string, RedirectionState>;
}