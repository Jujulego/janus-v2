import { render, Text } from 'ink';
import { each$, pipe$, readable$, var$, yield$ } from 'kyrielle';
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
  const redirections = pipe$(
    readable$((signal) => client.send(StatusCommandQuery, { signal })),
    each$(({ data }) => data.redirections),
    yield$(),
  );

  redirections.read();

  setTimeout(() => client.logger.warn('Cool !'), 2000);

  render(
    <>
      <StaticLogs />
      <Suspense fallback={<Text>Loading...</Text>}>
        <RedirectionStatusTable redirections={pipe$(redirections, store$(var$()))} />
      </Suspense>
    </>
  );
}
