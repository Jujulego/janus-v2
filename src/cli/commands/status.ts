import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { isTimeoutError } from '../../utils/error.js';
import { generateRedirectionId } from '../../utils/redirections.js';
import { CliLogger } from '../cli-tokens.js';

// Command
export interface StatusArgs {
  readonly redirection: string | undefined;
}

const command: CommandModule<unknown, StatusArgs> = {
  command: 'status [redirection]',
  describe: 'Prints redirection status of janus proxy server',
  builder: (parser) => parser
    .positional('redirection', {
      type: 'string',
      coerce: (arg: string) => /^[a-f0-9]{32}$/.test(arg) ? arg : generateRedirectionId(arg),
    }),
  async handler(args) {
    const logger = inject$(CliLogger);

    try {
      const { default: StatusCommand } = await import('./status.ink.jsx');
      await StatusCommand({ redirection: args.redirection });
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
