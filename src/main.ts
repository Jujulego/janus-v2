import 'reflect-metadata';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { start } from './commands/index.ts';
import { configMiddleware } from './middlewares/config.middleware.ts';
import { loggerMiddleware } from './middlewares/logger.middleware.ts';
import { version } from '../package.json' assert { type: 'json' };
import './graphql.d.ts';

// Bootstrap
(async () => {
  try {
    const parser = yargs(hideBin(process.argv))
      .scriptName('janus')
      .version(version);

    loggerMiddleware(parser);
    configMiddleware(parser);

    parser.command(start);

    await parser.parseAsync();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
