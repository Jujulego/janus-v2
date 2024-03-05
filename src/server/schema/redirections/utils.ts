import { RedirectionState } from '../../store/redirections/types.js';
import { Redirection } from '../schema.types.js';

// Utils
export function mapRedirection(redirection: RedirectionState | null): Redirection | null {
  return redirection && {
    id: redirection.id,
    url: redirection.url,
    outputs: redirection.outputs.map((name) => redirection.outputsByName[name]!)
  };
}

export function mapRedirectionList(list: RedirectionState[]): Redirection[] {
  return list.map((r) => mapRedirection(r)!);
}
