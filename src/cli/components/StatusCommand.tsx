import { render, Text } from 'ink';
import { each$, pipe$, store$, var$ } from 'kyrielle';
import { Suspense } from 'react';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import RedirectionStatusTable from './molecules/RedirectionStatusTable.jsx';
import StaticLogs from './StaticLogs.jsx';

// Query
const StatusCommandQuery = graphql(/* GraphQL */ `
  subscription StatusCommand {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

// Component
export default async function StatusCommand(client: JanusClient) {
  await client.initiate();

  const redirections$ = pipe$(
    client.subscribe$(StatusCommandQuery),
    each$(({ data }) => data!.redirections),
    store$(var$()),
  );

  render(
    <>
      <StaticLogs />
      <Suspense fallback={<Text>Loading...</Text>}>
        <RedirectionStatusTable redirections$={redirections$} />
      </Suspense>
    </>
  );
}
