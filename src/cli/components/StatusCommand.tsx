import type { ResultOf } from '@graphql-typed-document-node/core';
import type { ExecutionResult } from 'graphql-sse';
import { render, Text } from 'ink';
import { each$, observable$, pipe$, store$, var$ } from 'kyrielle';
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
    observable$<ExecutionResult<ResultOf<typeof StatusCommandQuery>>>((observer) => client.subscribe(observer, StatusCommandQuery)),
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
