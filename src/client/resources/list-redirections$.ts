import { each$, pipe$, readable$, resource$ } from 'kyrielle';

import { JanusClient } from '../janus-client.ts';
import { graphql } from '../gql/index.ts';

// Queries
const ListRedirectionsQuery = graphql(/* GraphQL */ `
    query ListRedirections {
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

export function listRedirections$(client: JanusClient) {
  return pipe$(
    resource$()
      .add(readable$((signal) => client.send(ListRedirectionsQuery, { signal })))
      .build(),
    each$(({ data }) => data?.redirections ?? [])
  );
}