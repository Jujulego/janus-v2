import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { CliLogger } from '../cli-tokens.js';

// Command
export interface EnableArgs {
  readonly redirection: string | undefined;
  readonly output: string | undefined;
}

const command: CommandModule<unknown, EnableArgs> = {
  command: 'enable [redirection] [output]',
  describe: 'Enables selected redirection',
  builder: (parser) => parser
    .positional('redirection', {
      type: 'string',
      describe: 'ID of the redirection to update',
    })
    .positional('output', {
      type: 'string',
      describe: 'Name of the output to enable',
    }),
  async handler(args) {
    const logger = inject$(CliLogger);

    try {
      console.log(args);
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
