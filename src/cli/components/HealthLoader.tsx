import { JanusClient } from '../../client/janus-client.js';
import { inked } from '../inked.jsx';
import Loader from './atoms/Loader.jsx';

// Component
export interface HealthLoaderProps {
  readonly client: JanusClient;
  readonly timeout?: number;
}

const HealthLoader = inked(async function* (props: HealthLoaderProps, controller) {
  const { client, timeout = 5000 } = props;
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    yield <Loader>Connecting ...</Loader>;
    return await client.serverHealth$.defer(controller.signal);
  } finally {
    clearTimeout(timeoutId);
  }
});

export default HealthLoader;