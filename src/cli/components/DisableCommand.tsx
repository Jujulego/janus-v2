import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { inked } from '../inked.jsx';
import Loader from './atoms/Loader.jsx';

// Query
const DisableOutputQuery = graphql(/* GraphQL */ `
  mutation DisableOutput($redirectionId: ID!, $outputName: String!) {
    disableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
      id
    }
  }
`);

// Component
export interface DisableCommandProps {
  readonly client: JanusClient;
  readonly redirectionId: string;
  readonly outputName: string;
  readonly timeout?: number;
}

const DisableCommand = inked(async function* (props: DisableCommandProps, controller) {
  const { client, redirectionId, outputName, timeout = 5000 } = props;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    yield <Loader>Connecting ...</Loader>;
    await client.serverHealth$.defer(controller.signal);

    yield <Loader>Enabling ...</Loader>;
    await client.request$(DisableOutputQuery, { redirectionId, outputName }).defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
});

export default DisableCommand;