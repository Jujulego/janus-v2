import { inject$ } from '@jujulego/injector';
import { fork } from 'node:child_process';
import path from 'node:path';
import url from 'node:url';
import { CommandModule } from 'yargs';

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
      const dirname = path.dirname(url.fileURLToPath(import.meta.url));

      const child = fork(path.resolve(dirname, './daemon.js'), [], {
        cwd: process.cwd(),
        detached: true,
        stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      });

      // Print outputs
      child.stdout?.on('data', (msg: Buffer) => {
        process.stdout.write(msg);
      });

      child.stderr?.on('data', (msg: Buffer) => {
        process.stderr.write(msg);
      });

      // Handle end
      child.on('close', (code) => {
        process.exit(code ?? 0);
      });
    } else {
      const { JanusProxy } = await import('../janus-proxy.ts');
      const proxy = inject$(JanusProxy);
      await proxy.start();
    }
  }
};

export default command;