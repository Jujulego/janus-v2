import { inject$ } from '@kyrielle/injector';
import process from 'node:process';

import { CliJanusClient, CliLogger } from '../cli-tokens.js';
import Loader from '../components/atoms/Loader.jsx';
import { inked } from '../inked.jsx';

// Component
const StopCommand = inked(async function* (_, { controller }) {
  using client = await inject$(CliJanusClient);
  const logger = inject$(CliLogger);
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    yield <Loader>Connecting ...</Loader>;
    const health = await client.serverHealth$.defer(controller.signal);

    logger.verbose`Reached janus server, running in process ${health.pid}`;
    logger.verbose`Sending SIGINT signal to janus proxy`;

    process.kill(health.pid, 'SIGINT');
    logger.info`Proxy stopped`;
  } finally {
    clearTimeout(timeoutId);
  }
});

export default StopCommand;