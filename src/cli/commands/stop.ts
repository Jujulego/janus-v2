import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { CliLogger } from '../cli-tokens.js';

// Command
const command: CommandModule = {
  command: 'stop',
  describe: 'Stops a running proxy server',
  async handler() {
    const logger = inject$(CliLogger);

    try {
      const { default: StopCommand } = await import('./stop.ink.jsx');
      await StopCommand({});
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
