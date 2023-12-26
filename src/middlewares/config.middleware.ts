import { inject$ } from '@jujulego/injector';
import { Argv } from 'yargs';

// Middleware
export function configMiddleware(parser: Argv) {
  return parser
    .option('config-file', {
      alias: 'c',
      type: 'string',
      description: 'Configuration file'
    })
    .middleware(async (args) => {
      const { JanusProxy } = await import('../janus-proxy.ts');
      const proxy = inject$(JanusProxy);

      if (args.configFile) {
        await proxy.loadConfig(args.configFile);
      } else {
        await proxy.searchConfig();
      }
    });
}