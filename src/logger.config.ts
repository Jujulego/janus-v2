import { inject$, singleton$, token$ } from '@jujulego/injector';
import { logger$, withLabel, withTimestamp } from '@jujulego/logger';

// Tokens
export const Logger = token$(
  () => logger$(withTimestamp()),
  { modifiers: [singleton$()] }
);

export function LabelledLogger(label: string) {
  return token$(() => {
    const logger = inject$(Logger);
    return logger.child(withLabel(label));
  });
}
