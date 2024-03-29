import { inject$ } from '@jujulego/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { CliJanusClient, CliLogger } from '../cli-tokens.js';

// Command
const command: CommandModule = {
  command: 'status',
  describe: 'Prints redirection status of janus proxy server',
  async handler() {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const { default: StatusCommand } = await import('../components/StatusCommand.jsx');
      await StatusCommand(client);
    } catch (err) {
      if (!isTimeoutError(err)) {
        logger.error('Error while evaluating proxy status:', err as Error);
      }

      logger.warn`Proxy server unreachable`;
      process.exit(1);
    }
  }
};

export default command;
