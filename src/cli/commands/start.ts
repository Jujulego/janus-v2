import { inject$ } from '@jujulego/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { CliJanusDaemon, CliJanusProxy, CliLogger } from '../cli-tokens.ts';

// Types
export interface StartArgs {
  daemon: boolean;
}

// Command
const command: CommandModule<unknown, StartArgs> = {
  command: 'start',
  describe: 'Starts janus proxy server',
  builder: (parser) => parser
    .option('daemon', {
      alias: 'd',
      type: 'boolean',
      default: false,
      describe: 'Start Janus as a proxy',
    }),
  async handler(args) {
    const logger = inject$(CliLogger);

    try {
      if (args.daemon) {
        const daemon = await inject$(CliJanusDaemon);
        await daemon.fork();
      } else {
        const proxy = await inject$(CliJanusProxy);
        await proxy.start();
      }
    } catch (err) {
      logger.error('Error while starting proxy:', err as Error);
      process.exit(1);
    }
  }
};

export default command;