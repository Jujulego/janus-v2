import { each$, pipe$, readable$, resource$ } from 'kyrielle';

import { JanusClient } from '../janus-client.ts';
import { Redirection } from '../../types/redirection.ts';
import { graphql } from '../gql/index.ts';

// Queries
const listRedirectionsQuery = graphql(/* GraphQL */ `
    query listRedirections {
        redirections {
            id
            url
            outputs {
                id
                name
                target
                enabled
                changeOrigin
                secure
                ws
            }
        }
    }
`);

interface RedirectionsResult {
  readonly redirections: Redirection[];
}

export function redirections$(client: JanusClient) {
  return pipe$(
    resource$()
      .add(readable$((signal) => client.send(listRedirectionsQuery, { signal })))
      .build(),
    each$(({ data }) => data?.redirections ?? [])
  );
}