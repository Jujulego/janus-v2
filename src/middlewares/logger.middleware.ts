import { inject$ } from '@jujulego/injector';
import { LogLabel, LogLevel, LogLevelKey, qlevelColor, quick, toStderr, WithTimestamp } from '@jujulego/logger';
import { qprop } from '@jujulego/quick-tag';
import { chalkTemplateStderr } from 'chalk-template';
import { flow$ } from 'kyrielle/operators';
import { filter$ } from 'kyrielle/steps';
import { Argv } from 'yargs';
import os from 'node:os';

// Types
type JanusLog = WithTimestamp & Partial<LogLabel>;

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
      const { JanusProxy } = await import('../janus-proxy.ts');
      const proxy = inject$(JanusProxy);

      const logLevel = args.verbose ? LogLevel[args.verbose] : LogLevel.info;

      flow$(
        proxy.logger,
        filter$((log) => log.level >= logLevel),
        toStderr(qlevelColor(
          quick.wrap(chalkTemplateStderr)
            .function<JanusLog>`#?:${qprop('label')}{grey [#$]} ?#${qprop('message')}#?:${qprop('error')}${os.EOL}#!error$?#  `
        ))
      );
    });
}