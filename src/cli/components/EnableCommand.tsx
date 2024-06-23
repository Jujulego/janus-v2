import { render } from 'ink';

import type { JanusClient } from '../../client/janus-client.js';
import { graphql } from '../../gql/index.js';
import Loader from './atoms/Loader.jsx';
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
export interface EnableCommandArgs {
  readonly redirectionId: string;
  readonly outputName: string;
  readonly timeout?: number;
}

export default async function EnableCommand(client: JanusClient, args: EnableCommandArgs) {
  const { redirectionId, outputName, timeout = 5000 } = args;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

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
        <Loader>Enabling ...</Loader>
      </>
    );

    await client.request$(EnableOutputQuery, { redirectionId, outputName }).defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
    app.clear();
    app.unmount();
  }
}