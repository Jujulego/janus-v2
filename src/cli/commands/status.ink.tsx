import { inject$ } from '@kyrielle/injector';
import { each$, pipe$, store$, var$ } from 'kyrielle';

import { graphql } from '../../gql/index.js';
import { CliJanusClient } from '../cli-tokens.js';
import ClientLayout from '../components/client/ClientLayout.jsx';
import OutputStatusTable from '../components/outputs/OutputStatusTable.jsx';
import RedirectionStatusTable from '../components/redirections/RedirectionStatusTable.jsx';
import { inked } from '../inked.jsx';

// Query
const ListRedirectionsQuery = graphql(/* GraphQL */ `
  subscription ListRedirections {
    redirections {
      ...RedirectionStatusItem
    }
  }
`);

const RedirectionQuery = graphql(/* GraphQL */ `
  subscription Redirection($id: ID!) {
    redirection(id: $id) {
      ...RedirectionWithOutputs
    }
  }
`);

// Component
export interface StatusCommandProps {
  readonly redirection: string | undefined;
}

const StatusCommand = inked(async function* (props: StatusCommandProps, { app }) {
  using client = await inject$(CliJanusClient);
  const { redirection } = props;

  if (redirection) {
    const redirection$ = pipe$(
      client.subscribe$(RedirectionQuery, { id: redirection }),
      each$(({ data }) => data!.redirection),
      store$(var$()),
    );

    yield (
      <ClientLayout client={client}>
        <OutputStatusTable redirection$={redirection$} />
      </ClientLayout>
    );
  } else {
    const redirections$ = pipe$(
      client.subscribe$(ListRedirectionsQuery),
      each$(({ data }) => data!.redirections),
      store$(var$()),
    );

    yield (
      <ClientLayout client={client}>
        <RedirectionStatusTable redirections$={redirections$}/>
      </ClientLayout>
    );
  }

  await app.waitUntilExit();
});

export default StatusCommand;
