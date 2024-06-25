import { each$, pipe$, store$, var$ } from 'kyrielle';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { inked } from '../inked.jsx';
import WithClientLayout from './layouts/WithClientLayout.jsx';
import RedirectionStatusTable from './molecules/RedirectionStatusTable.jsx';

// Query
const StatusCommandQuery = graphql(/* GraphQL */ `
  subscription StatusCommand {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

// Component
export interface StatusCommandProps {
  readonly client: JanusClient;
}

const StatusCommand = inked(async function* ({ client }: StatusCommandProps, { app }) {
  const redirections$ = pipe$(
    client.subscribe$(StatusCommandQuery),
    each$(({ data }) => data!.redirections),
    store$(var$()),
  );

  yield (
    <WithClientLayout client={client}>
      <RedirectionStatusTable redirections$={redirections$} />
    </WithClientLayout>
  );

  await app.waitUntilExit();
});

export default StatusCommand;
