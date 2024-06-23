import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import { inked } from '../inked.jsx';
import Loader from './atoms/Loader.jsx';

// Query
const EnableOutputQuery = graphql(/* GraphQL */ `
  mutation EnableOutput($redirectionId: ID!, $outputName: String!) {
    enableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
      id
    }
  }
`);

// Component
export interface EnableCommandProps {
  readonly client: JanusClient;
  readonly redirectionId: string;
  readonly outputName: string;
  readonly timeout?: number;
}

const EnableCommand = inked(async function* (props: EnableCommandProps, controller) {
  const { client, redirectionId, outputName, timeout = 5000 } = props;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    yield <Loader>Connecting ...</Loader>;
    await client.serverHealth$.defer(controller.signal);

    yield <Loader>Enabling ...</Loader>;
    await client.request$(EnableOutputQuery, { redirectionId, outputName }).defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
});

export default EnableCommand;