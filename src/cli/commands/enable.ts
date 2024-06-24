import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { CliJanusClient, CliLogger } from '../cli-tokens.js';

// Command
export interface EnableArgs {
  readonly redirection: string | undefined;
  readonly output: string | undefined;
  readonly timeout: number;
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
    })
    .option('timeout', {
      type: 'number',
      default: 5000,
      describe: 'Timeout in milliseconds',
    }),
  async handler(args) {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const { default: EnableCommand } = await import('../components/EnableCommand.jsx');

      const enabled = await EnableCommand({
        client,
        redirectionId: args.redirection,
        outputName: args.output,
        timeout: args.timeout,
      });

      logger.info`Output ${enabled.outputName} of ${enabled.redirectionId} enabled`;
    } catch (err) {
      if (!isTimeoutError(err)) {
        logger.error('Error while enabling proxy output:', err as Error);
      }

      logger.warn`Proxy server unreachable`;
      process.exit(1);
    }
  }
};

export default command;
