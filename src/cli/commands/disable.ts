import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { CliJanusClient, CliLogger } from '../cli-tokens.js';

// Command
export interface DisableArgs {
  readonly redirection: string;
  readonly output: string;
}

const command: CommandModule<unknown, DisableArgs> = {
  command: 'disable <redirection> <output>',
  describe: 'Disables selected redirection',
  builder: (parser) => parser
    .positional('redirection', {
      type: 'string',
      describe: 'ID of the redirection to update',
    })
    .option('output', {
      type: 'string',
      describe: 'Name of the output to enable',
    })
    .demandOption(['output', 'redirection']),
  async handler(args) {
    const client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const { default: DisableCommand } = await import('../components/DisableCommand.jsx');
      await DisableCommand(client, args.redirection, args.output);
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
