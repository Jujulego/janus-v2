import { pipe$, var$, waitFor$, yield$ } from 'kyrielle';

import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { inked } from '../inked.jsx';
import Loader from './atoms/Loader.jsx';
import OutputSelect from './atoms/OutputSelect.jsx';
import RedirectionSelect from './atoms/RedirectionSelect.jsx';

// Query
const EnableOutputQuery = graphql(/* GraphQL */ `
  mutation EnableOutput($redirectionId: ID!, $outputName: String!) {
    enableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
      id
    }
  }
`);

const ListRedirectionsQuery = graphql(/* GraphQL */ `
  query ListRedirections {
    redirections {
      id
      ...RedirectionItem
      
      outputs {
        ...OutputItem
      }
    }
  }
`);

// Component
export interface EnableCommandProps {
  readonly client: JanusClient;
  readonly redirectionId: string | undefined;
  readonly outputName: string | undefined;
  readonly timeout?: number;
}

const EnableCommand = inked(async function* (props: EnableCommandProps, controller) {
  const { client, timeout = 5000 } = props;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    yield <Loader>Connecting ...</Loader>;

    const redirections = await client.request$(ListRedirectionsQuery).defer(controller.signal);
    let redirectionId = props.redirectionId;

    if (!redirectionId) {
      const redirectionId$ = pipe$(var$<string>(), yield$());
      yield <RedirectionSelect
        items={redirections.data!.redirections}
        onSelect={({ id }) => redirectionId$.mutate(id)}
      />;

      redirectionId = await waitFor$(redirectionId$);
    }

    const outputs = redirections.data!.redirections.find((redirection) => redirection.id !== redirectionId)!.outputs;
    let outputName = props.outputName;

    if (!outputName) {
      const outputName$ = pipe$(var$<string>(), yield$());
      yield <OutputSelect items={outputs} onSelect={({ name }) => outputName$.mutate(name)} />;

      outputName = await waitFor$(outputName$);
    }

    yield <Loader>Enabling ...</Loader>;
    await client.request$(EnableOutputQuery, { redirectionId, outputName }).defer();

    return { redirectionId, outputName };
  } finally {
    clearTimeout(timeoutId);
  }
});

export default EnableCommand;