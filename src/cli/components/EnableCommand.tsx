import { render, Text } from 'ink';
import Spinner from 'ink-spinner';

import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import StaticLogs from './StaticLogs.jsx';

// Query
const EnableOutputQuery = graphql(/* GraphQL */ `
  mutation EnableOutput($redirectionId: ID!, $outputName: String!) {
    enableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
      id
    }
  }
`);

// Component
export default async function EnableCommand(client: JanusClient, redirectionId: string, outputName: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const app = render(
    <>
      <StaticLogs />
      <Text>
        <Spinner type="dots" />
        {' '}Connecting ...
      </Text>
    </>
  );

  try {
    app.waitUntilExit().then(() => {
      controller.abort();
    });

    await client.serverHealth$.defer(controller.signal);

    app.rerender(
      <>
        <StaticLogs />
        <Text>
          <Spinner type="dots" />
          {' '}Enabling ...
        </Text>
      </>
    );

    await client.request$(EnableOutputQuery, { redirectionId, outputName }).defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
    app.clear();
    app.unmount();
  }
}