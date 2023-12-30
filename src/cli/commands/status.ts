import { inject$ } from '@jujulego/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { version } from '../../../package.json' assert { type: 'json' };
import { CliJanusClient, CliLogger } from '../cli-tokens.ts';

// Command
const command: CommandModule = {
  command: 'status',
  describe: 'Prints status of janus proxy server',
  async handler() {
    const logger = inject$(CliLogger);

    try {
      const client = await inject$(CliJanusClient);

      if (await client.connect()) {
        logger.info`Client version: ${version}`;
        logger.info`Server version: ${client.serverHealth$.read()!.version}`;

        client.disconnect();
      } else {
        logger.info`Client version: ${version}`;
        logger.info`Server version: unreachable`;
      }
    } catch (err) {
      logger.error('Error while evaluating proxy status:', err as Error);
      process.exit(1);
    }
  }
};

export default command;