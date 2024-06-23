import { inject$ } from '@kyrielle/injector';
import chalk from 'chalk';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { version } from '../../../package.json' assert { type: 'json' };
import { CliJanusClient, CliLogger } from '../cli-tokens.js';
import { isTimeoutError } from '../../utils/error.js';

// Command
export interface VersionArgs {
  readonly timeout: number;
}

const command: CommandModule<unknown, VersionArgs> = {
  command: 'version',
  describe: 'Prints version of janus client and connected proxy server',
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

      logger.info`client/${version} proxy/${health.version}`;
    } catch (err) {
      if (!isTimeoutError(err)) {
        logger.error('Error while evaluating proxy status:', err as Error);
      }

      logger.info`client/${version} proxy/${chalk.grey('unreachable')}`;
      process.exit(1);
    }
  }
};

export default command;
