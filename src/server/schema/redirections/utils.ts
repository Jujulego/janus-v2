import { RedirectionState } from '../../store/redirections/types.js';
import { Redirection } from '../schema.types.js';

// Utils
export function resolveRedirection(redirection: RedirectionState): Redirection;
export function resolveRedirection(redirection: RedirectionState | undefined): Redirection | null;

export function resolveRedirection(redirection: RedirectionState | undefined): Redirection | null {
  if (!redirection) return null;

  return {
    id: redirection.id,
    url: redirection.url,
    outputs: redirection.outputs.map((name) => redirection.outputsByName[name]!)
  };
}

export function resolveRedirectionList(list: RedirectionState[]): Redirection[] {
  return list.map((r) => resolveRedirection(r));
}
