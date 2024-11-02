import { inject$ } from '@kyrielle/injector';

import { CliJanusClient } from '../cli-tokens.js';
import Loader from '../components/atoms/Loader.jsx';
import { inked } from '../inked.jsx';

// Component
const VersionCommand = inked(async function* (_, { controller }) {
  using client = await inject$(CliJanusClient);
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    yield <Loader>Connecting ...</Loader>;
    const health = await client.serverHealth$.defer(controller.signal);

    return health.version;
  } finally {
    clearTimeout(timeoutId);
  }
});

export default VersionCommand;