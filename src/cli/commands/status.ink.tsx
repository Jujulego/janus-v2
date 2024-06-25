import { inject$ } from '@kyrielle/injector';
import { each$, pipe$, store$, var$ } from 'kyrielle';

import { graphql } from '../../gql/index.js';
import { CliJanusClient } from '../cli-tokens.js';
import WithClientLayout from '../components/client/WithClientLayout.jsx';
import RedirectionStatusTable from '../components/redirections/RedirectionStatusTable.jsx';
import { inked } from '../inked.jsx';

// Query
const StatusCommandQuery = graphql(/* GraphQL */ `
  subscription StatusCommand {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

// Component
const StatusCommand = inked(async function* (_, { app }) {
  using client = await inject$(CliJanusClient);

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
