import { inject$, singleton$, token$ } from '@jujulego/injector';
import {
  logger$,
  LogLabel,
  qlevelColor,
  quick,
  toStderr,
  withLabel,
  WithTimestamp,
  withTimestamp
} from '@jujulego/logger';
import { flow$ } from '@jujulego/aegis';
import { chalkTemplateStderr } from 'chalk-template';
import { qprop } from '@jujulego/quick-tag';

// Types
export type JanusLog = WithTimestamp & Partial<LogLabel>;

// Utils
export const janusLogFormat = qlevelColor(
  quick.wrap(chalkTemplateStderr)
    .function<JanusLog>`#?:${qprop('label')}{grey [#$]} ?#${qprop('message')}`
);

// Tokens
export const Logger = token$(
  () => {
    const logger = logger$(withTimestamp());
    flow$(logger, toStderr(janusLogFormat));

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
