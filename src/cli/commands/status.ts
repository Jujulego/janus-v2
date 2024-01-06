import { inject$ } from '@jujulego/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { version } from '../../../package.json' assert { type: 'json' };
import { AbortError } from '../../client/errors.ts';
import { CliJanusClient, CliLogger } from '../cli-tokens.ts';

// Command
const command: CommandModule = {
  command: 'status',
  describe: 'Prints status of janus proxy server',
  async handler() {
    const logger = inject$(CliLogger);

    try {
      using client = await inject$(CliJanusClient);
      const health = await client.initiate(AbortSignal.timeout(5000));

      logger.info`Client version: ${version}`;
      logger.info`Server version: ${health.version}`;
    } catch (err) {
      if (err instanceof AbortError) {
        logger.warn('Cannot reach janus server');
      } else {
        logger.error('Error while evaluating proxy status:', err as Error);
      }

      process.exit(1);
    }
  }
};

export default command;