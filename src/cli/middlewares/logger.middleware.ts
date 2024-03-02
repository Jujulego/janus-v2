import { inject$ } from '@jujulego/injector';
import { defineQuickFormat, q$, qerror, qprop, qwrap } from '@jujulego/quick-tag';
import { envDebugFilter, Log, LogLevel, LogLevelKey, toStderr } from '@kyrielle/logger';
import { ColorName, ModifierName } from 'chalk';
import { chalkTemplateStderr } from 'chalk-template';
import { filter$, flow$ } from 'kyrielle';
import os from 'node:os';
import { Argv } from 'yargs';

import { CliLogger } from '../cli-tokens.ts';

// Utils
const VERBOSITY_LEVEL: Record<number, LogLevelKey> = {
  1: 'verbose',
  2: 'debug',
};

const LEVEL_COLORS = {
  [LogLevel.debug]: 'grey',
  [LogLevel.verbose]: 'blue',
  [LogLevel.info]: 'reset',
  [LogLevel.warning]: 'yellow',
  [LogLevel.error]: 'red',
} satisfies Record<LogLevel, ColorName | ModifierName>;

const logColor = defineQuickFormat((level: LogLevel) => LEVEL_COLORS[level])(qprop<Log, 'level'>('level'));

const logFormat = qwrap(chalkTemplateStderr)
  .fun<Log>`#?:${qprop('label')}{grey [${q$}]} ?#{${logColor} ${qprop('message')}#?:${qerror(qprop<Log>('error'))}${os.EOL}${q$}?#}`;

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
        filter$((log: Log) => log.level >= logLevel),
        envDebugFilter(),
        toStderr(logFormat)
      );
    });
}
