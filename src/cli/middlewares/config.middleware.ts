import { inject$ } from '@jujulego/injector';
import { Argv } from 'yargs';

import { CliConfigService } from '../cli-tokens.ts';

// Middleware
export function configMiddleware(parser: Argv) {
  return parser
    .option('config-file', {
      alias: 'c',
      type: 'string',
      description: 'Configuration file'
    })
    .middleware(async (args) => {
      const config = inject$(CliConfigService);

      if (args.configFile) {
        await config.loadConfig(args.configFile);
      } else {
        await config.searchConfig();
      }
    });
}