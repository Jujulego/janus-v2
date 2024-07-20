import { inject$ } from '@kyrielle/injector';
import process from 'node:process';
import { CommandModule } from 'yargs';

import { CliJanusDaemon, CliJanusProxy, CliLogger } from '../cli-tokens.js';

// Command
export interface StartArgs {
  readonly daemon: boolean;
}

const command: CommandModule<unknown, StartArgs> = {
  command: 'start',
  aliases: ['$0'],
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

        process.once('SIGINT', () => {
          logger.info`Received SIGINT signal, initiate clean stop`;
          proxy.stop().then(
            () => process.exit(0),
            (err) => logger.error('Failed to stop janus proxy server', err as Error),
          );
        });
      }
    } catch (err) {
      logger.error('Error while starting proxy:', err as Error);
      process.exit(1);
    }
  }
};

export default command;
