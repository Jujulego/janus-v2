import { each$, pipe$, readable$, resource$ } from 'kyrielle';
import { ListRedirections } from './redirections.module.graphql';

import { JanusClient } from '../janus-client.ts';
import { Redirection } from '../../types/redirection.ts';

interface RedirectionsResult {
  readonly redirections: Redirection[];
}

export function redirections$(client: JanusClient) {
  return pipe$(
    resource$()
      .add(readable$((signal) => client.send<RedirectionsResult>(ListRedirections, { signal })))
      .build(),
    each$(({ data }) => data?.redirections ?? [])
  );
}