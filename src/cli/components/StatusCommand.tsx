import { render, Text } from 'ink';
import { each$, observable$, pipe$, readable$, retry$, timeout$, var$, yield$ } from 'kyrielle';
import { Suspense } from 'react';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { store$ } from '../../utils/store.js';
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
    observable$((observer) => {
      client.subscribe(observer, StatusCommandQuery);
      return 'cool';
    }),
    each$(({ data }) => data!.redirections),
    //yield$(),
    store$(var$()),
  );

//  redirections$.refresh();

  render(
    <>
      <StaticLogs />
      <Suspense fallback={<Text>Loading...</Text>}>
        <RedirectionStatusTable redirections$={redirections$} />
      </Suspense>
    </>
  );
}
