import { each$, observable$, pipe$, readable$, resource$ } from 'kyrielle';

import { JanusClient } from '../janus-client.js';
import { graphql, unmask } from '../../gql/index.js';

// Fragments
export const RedirectionItem = graphql(/* GraphQL */ `
  fragment RedirectionItem on Redirection {
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
`);

// Queries
const ListRedirectionsQuery = graphql(/* GraphQL */ `
  query ListRedirections {
    redirections {
      ...RedirectionItem
    }
  }
`);

const ListRedirectionsStream = graphql(/* GraphQL */ `
  subscription ListRedirectionsStream {
    redirections {
      ...RedirectionItem
    }
  }
`);

export function listRedirections$(client: JanusClient) {
  return pipe$(
    resource$()
      .add(readable$((signal) => client.send(ListRedirectionsQuery, { signal })))
      .add(observable$((observer, signal) => client.subscribe(observer, ListRedirectionsStream, { signal })))
      .build(),
    each$(({ data }) => data?.redirections ?? []),
    each$((redirections) => redirections.map((r) => unmask(RedirectionItem, r)))
  );
}
