import { render, Text } from 'ink';
import Spinner from 'ink-spinner';

import type { HealthPayload } from '../../client/health.ref.js';
import { JanusClient } from '../../client/janus-client.js';

// Component
export default async function HealthLoader(client: JanusClient, timeout = 5000): Promise<HealthPayload> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const app = render(
    <Text>
      <Spinner type="dots" />
      {' '}Connecting ...
    </Text>
  );

  try {
    app.waitUntilExit().then(() => {
      controller.abort();
      return new Promise<never>(() => {});
    });

    return await client.serverHealth$.read(controller.signal);
  } finally {
    clearTimeout(timeoutId);
    app.clear();
    app.unmount();
  }
}