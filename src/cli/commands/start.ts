import { inject$ } from '@jujulego/injector';
import { CommandModule } from 'yargs';

import { CliJanusDaemon, CliJanusProxy } from '../cli-tokens.ts';

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
    if (args.daemon) {
      const daemon = await inject$(CliJanusDaemon);
      await daemon.fork();
    } else {
      const proxy = await inject$(CliJanusProxy);
      await proxy.start();
    }
  }
};

export default command;