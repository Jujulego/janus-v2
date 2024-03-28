import { render, Text } from 'ink';
import { each$, pipe$, readable$, retry$, timeout$, var$, yield$ } from 'kyrielle';
import { Suspense } from 'react';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { store$ } from '../../utils/store.js';
import RedirectionStatusTable from './molecules/RedirectionStatusTable.jsx';
import StaticLogs from './StaticLogs.jsx';

// Query
const StatusCommandQuery = graphql(/* GraphQL */ `
  query StatusCommand {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

// Component
export default function StatusCommand(client: JanusClient) {
  const redirections$ = pipe$(
    readable$((signal) => client.send(StatusCommandQuery, { signal })),
    retry$('read', {
      tryTimeout: 1000,
      onRetry: () => timeout$(1000),
    }),
    each$(({ data }) => data!.redirections),
    yield$(),
    store$(var$()),
  );

  redirections$.refresh();

  render(
    <>
      <StaticLogs />
      <Suspense fallback={<Text>Loading...</Text>}>
        <RedirectionStatusTable redirections$={redirections$} />
      </Suspense>
    </>
  );
}
