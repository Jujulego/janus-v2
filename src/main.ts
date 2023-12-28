import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import 'reflect-metadata/lite';

import { version } from '../package.json' assert { type: 'json' };
import { start } from './cli/commands.ts';
import { configMiddleware } from './cli/middlewares/config.middleware.ts';
import { loggerMiddleware } from './cli/middlewares/logger.middleware.ts';
import './graphql.d.ts';

// Bootstrap
(async () => {
  const parser = yargs(hideBin(process.argv))
    .scriptName('janus')
    .version(version);

  loggerMiddleware(parser);
  configMiddleware(parser);

  parser.command(start)
    .demandCommand()
    .strictCommands()
    .recommendCommands();

  await parser.parseAsync();
})();
