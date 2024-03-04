import { inject$ } from '@jujulego/injector';
import chalk from 'chalk';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { listRedirections$ } from '../../client/resources/list-redirections$.ts';
import { isTimeoutError } from '../../utils/error.ts';
import { CliJanusClient, CliLogger } from '../cli-tokens.ts';

// Command
const command: CommandModule = {
  command: 'status',
  describe: 'Prints redirection status of janus proxy server',
  async handler() {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      const redirections = await listRedirections$(client).read();
      const length = redirections.reduce((max, { url }) => Math.max(max, url.length), 0);

      for (const redirection of redirections) {
        const output = redirection.outputs.find((output) => output.enabled);
        const spaces = ' '.repeat(length - redirection.url.length);

        if (output) {
          logger.info`${redirection.url + spaces} -> ${output.name} (${output.target})`;
        } else {
          logger.warn`${redirection.url + spaces} |> ${chalk.bold('all outputs are disabled')}`;
        }
      }
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
