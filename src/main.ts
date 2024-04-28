import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import 'reflect-metadata/lite';

import { version } from '../package.json' assert { type: 'json' };
import * as commands from './cli/commands.js';
import { configMiddleware } from './cli/middlewares/config.middleware.js';
import { loggerMiddleware } from './cli/middlewares/logger.middleware.js';
import './graphql.d.js';

// Bootstrap
(async () => {
  const parser = yargs(hideBin(process.argv))
    .scriptName('janus')
    .version(version);

  loggerMiddleware(parser);
  configMiddleware(parser);

  parser.command(commands.start)
    .command(commands.status)
    .command(commands.stop)
    .command(commands.version)
    .demandCommand()
    .strictCommands()
    .recommendCommands();

  await parser.parseAsync();
})();
