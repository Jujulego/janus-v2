import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { CliJanusClient, CliLogger } from '../cli-tokens.js';
import { isTimeoutError } from '../../utils/error.js';

// Command
export interface StopArgs {
  readonly timeout: number;
}

const command: CommandModule<unknown, StopArgs> = {
  command: 'stop',
  describe: 'Stops a running proxy server',
  builder: (parser) => parser
    .option('timeout', {
      type: 'number',
      default: 5000,
      describe: 'Timeout in milliseconds',
    }),
  async handler(args) {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const { default: HealthLoader } = await import('../components/HealthLoader.jsx');
      const health = await HealthLoader({ client, timeout: args.timeout });

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
