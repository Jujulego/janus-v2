import { render } from 'ink';
import { each$, pipe$, store$, var$ } from 'kyrielle';

import { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
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
export default function StatusCommand(client: JanusClient) {
  const redirections$ = pipe$(
    client.subscribe$(StatusCommandQuery),
    each$(({ data }) => data!.redirections),
    store$(var$()),
  );

  render(
    <WithClientLayout client={client}>
      <RedirectionStatusTable redirections$={redirections$} />
    </WithClientLayout>
  );
}
