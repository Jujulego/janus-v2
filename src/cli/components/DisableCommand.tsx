import { render } from 'ink';

import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import Loader from './atoms/Loader.jsx';
import StaticLogs from './StaticLogs.jsx';

// Query
const DisableOutputQuery = graphql(/* GraphQL */ `
  mutation DisableOutput($redirectionId: ID!, $outputName: String!) {
    disableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
      id
    }
  }
`);

// Component
export default async function DisableCommand(client: JanusClient, redirectionId: string, outputName: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const app = render(
    <>
      <StaticLogs />
      <Loader>Connecting ...</Loader>
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
        <Loader>Disabling ...</Loader>
      </>
    );

    await client.request$(DisableOutputQuery, { redirectionId, outputName }).defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
    app.clear();
    app.unmount();
  }
}