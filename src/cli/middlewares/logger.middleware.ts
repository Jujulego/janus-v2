import { inject$ } from '@kyrielle/injector';
import { defineQuickFormat, q$, qarg, qerror, qprop, qwrap } from '@jujulego/quick-tag';
import {
  Log,
  logDebugFilter$,
  logDelay$,
  LogGateway,
  LogLevel,
  LogLevelKey,
  qLogDelay,
  toStderr,
  WithDelay
} from '@kyrielle/logger';
import { ColorName, ModifierName } from 'chalk';
import { chalkTemplateStderr } from 'chalk-template';
import { filter$, flow$ } from 'kyrielle';
import os from 'node:os';
import { Argv } from 'yargs';

import { CliLogger } from '../cli-tokens.js';

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
export const logFormat = qwrap(chalkTemplateStderr)
  .fun`#?:${qprop('label')}{grey [${q$}]} ?#{${logColor} ${qprop('message')} {grey +${qLogDelay(qarg<WithDelay>())}}#?:${qerror(qprop<Log>('error'))}${os.EOL}${q$}?#}`;

// Middleware
export function loggerMiddleware(parser: Argv) {
  return parser
    .option('verbose', {
      alias: 'v',
      type: 'count',
      description: 'Set verbosity level',
      coerce: (cnt: number) => VERBOSITY_LEVEL[Math.min(cnt, 2)]
    })
    .middleware((args) => {
      const logLevel = args.verbose ? LogLevel[args.verbose] : LogLevel.info;
      const logGateway = inject$(LogGateway);

      flow$(
        inject$(CliLogger),
        filter$((log) => log.level >= logLevel),
        logDebugFilter$(),
        logDelay$(),
        logGateway,
      );

      logGateway.connect('console', toStderr(logFormat));
    });
}
