import { inject$ } from '@jujulego/injector';
import { CommandModule } from 'yargs';

// Command
const command: CommandModule = {
  command: 'start',
  describe: 'Starts janus proxy server',
  async handler() {
    const { JanusProxy } = await import('../janus-proxy.ts');
    const proxy = inject$(JanusProxy);
    await proxy.start();
  }
};

export default command;