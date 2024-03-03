import { inject$ } from '@jujulego/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { CliJanusClient, CliLogger } from '../cli-tokens.ts';
import { isTimeoutError } from '../../utils/error.ts';
import { redirections$ } from '../../client/resources/redirections$.ts';

// Command
const command: CommandModule = {
  command: 'status',
  describe: 'Prints redirection status of janus proxy server',
  async handler() {
    using client = await inject$(CliJanusClient);
    const logger = inject$(CliLogger);

    try {
      //await client.initiate(AbortSignal.timeout(5000));
      const redirections = redirections$(client);

      console.log(await redirections.read());
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
