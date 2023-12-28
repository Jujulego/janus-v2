import { inject$ } from '@jujulego/injector';
import { Log, LogLabel, LogLevel, LogLevelKey, qlevelColor, quick, toStderr } from '@jujulego/logger';
import { qprop } from '@jujulego/quick-tag';
import { chalkTemplateStderr } from 'chalk-template';
import { flow$ } from 'kyrielle/operators';
import { filter$ } from 'kyrielle/steps';
import os from 'node:os';
import { Argv } from 'yargs';

import { CliLogger } from '../cli-tokens.ts';

// Types
type JanusLog = Log & Partial<LogLabel>;

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
        toStderr(qlevelColor(
          quick.wrap(chalkTemplateStderr)
            .function<JanusLog>`#?:${qprop('label')}{grey [#$]} ?#${qprop('message')}#?:${qprop('error')}${os.EOL}#!error$?#  `
        ))
      );
    });
}