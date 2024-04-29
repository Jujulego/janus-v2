import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { CliJanusClient, CliLogger } from '../cli-tokens.js';
import { isTimeoutError } from '../../utils/error.js';

// Command
const command: CommandModule = {
  command: 'stop',
  describe: 'Stops a running proxy server',
  async handler() {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const { default: HealthLoader } = await import('../components/HealthLoader.jsx');
      const health = await HealthLoader(client);

      logger.verbose`Reached janus server, running in process ${health.pid}`;
      logger.verbose`Sending SIGINT signal to janus proxy`;
      logger.info`Proxy stopped`;

      process.kill(health.pid, 'SIGINT');
    } catch (err) {
      if (!isTimeoutError(err)) {
        logger.error('Error while evaluating proxy status:', err as Error);
      } else {
        logger.warning`Cannot reach janus proxy, is it really started?`;
      }

      process.exit(1);
    }
  }
};

export default command;
