import { Logger } from '@jujulego/logger';
import { timer$ } from 'kyrielle/events';
import { deduplicate$, pipe$, retry$ } from 'kyrielle/pipe';
import { ref$ } from 'kyrielle/refs';
import { waitFor$ } from 'kyrielle/subscriptions';

// Type
export interface HealthPayload {
  readonly version: string;
}

// Utils
export function isHealthPayload(payload: unknown): payload is HealthPayload {
  return !!payload && typeof payload === 'object' && 'version' in payload && typeof payload.version === 'string';
}

// Reference
export function health$(url: URL, logger: Logger) {
  return pipe$(
    ref$({
      async read(signal) {
        logger.debug`Requesting server health at ${url}`;
        const res = await fetch(url, { signal: signal ?? null });

        if (res.ok) {
          const payload = await res.json();

          if (isHealthPayload(payload)) {
            return payload;
          } else {
            logger.debug`Server answered but health payload is invalid: #!json:${payload}`;
            throw new Error('Invalid health payload');
          }
        } else {
          logger.debug`Server responded with a ${res.status} error: ${await res.text()}`;
          throw new Error(`Server responded with a ${res.status} error`);
        }
      }
    }),
    retry$('read', {
      tryTimeout: 1000,
      async onRetry() {
        await waitFor$(timer$(1000));
      },
    }),
    deduplicate$('read'),
  );
}