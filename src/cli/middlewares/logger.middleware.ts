import { inject$ } from '@jujulego/injector';
import { debugFilter, Log, LogLevel, LogLevelKey, qLevelColor, toStderr } from '@jujulego/logger';
import { q$, qerror, qprop, qwrap } from '@jujulego/quick-tag';
import { chalkTemplateStderr } from 'chalk-template';
import { filter$, flow$ } from 'kyrielle/pipe';
import os from 'node:os';
import { Argv } from 'yargs';

import { CliLogger } from '../cli-tokens.ts';

// Utils
const VERBOSITY_LEVEL: Record<number, LogLevelKey> = {
  1: 'verbose',
  2: 'debug',
};

// Middleware
export function loggerMiddleware(parser: Argv) {
  return parser
    .option('verbose', {
      alias: 'v',
      type: 'count',
      description: 'Set verbosity level',
      coerce: (cnt) => VERBOSITY_LEVEL[Math.min(cnt, 2)]
    })
    .middleware(async (args) => {
      const logLevel = args.verbose ? LogLevel[args.verbose] : LogLevel.info;
      const logger = inject$(CliLogger);

      flow$(
        logger,
        filter$((log) => log.level >= logLevel),
        debugFilter(),
        toStderr(qLevelColor(
          qwrap(chalkTemplateStderr)
            .fun<Log>`#?:${qprop('label')}{grey [${q$}]} ?#${qprop('message')}#?:${qerror(qprop<Log>('error'))}${os.EOL}${q$}?#`
        ))
      );
    });
}