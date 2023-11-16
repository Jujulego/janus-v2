import { chalkTemplateStderr } from 'chalk-template';
import { filter$, flow$, var$ } from '@jujulego/aegis';
import { inject$, singleton$, token$ } from '@jujulego/injector';
import {
  logger$,
  LogLabel, LogLevel,
  qlevelColor,
  quick,
  toStderr,
  withLabel,
  WithTimestamp,
  withTimestamp
} from '@jujulego/logger';
import { qprop } from '@jujulego/quick-tag';
import os from 'node:os';

// Types
export type JanusLog = WithTimestamp & Partial<LogLabel>;

// Utils
export const logLevel = var$(LogLevel.info);
export const logFormat = qlevelColor(
  quick.wrap(chalkTemplateStderr)
    .function<JanusLog>`#?:${qprop('label')}{grey [#$]} ?#${qprop('message')}#?:${qprop('error')}${os.EOL}#!error$?#  `
);

// Tokens
export const Logger = token$(
  () => {
    const logger = logger$(withTimestamp());

    flow$(
      logger,
      filter$((log) => log.level >= logLevel.read()),
      toStderr(logFormat)
    );

    return logger;
  },
  { modifiers: [singleton$()] }
);

export function LabelledLogger(label: string) {
  return token$(() => {
    const logger = inject$(Logger);
    return logger.child(withLabel(label));
  });
}
