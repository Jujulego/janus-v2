import { Logger } from '@jujulego/logger';
import { dom$ } from 'kyrielle/browser';
import { ref$ } from 'kyrielle/refs';
import { dedupeRead$, pipe$ } from 'kyrielle/pipe';
import { once$ } from 'kyrielle/subscriptions';

import { AbortError } from './errors.ts';

// Type
export interface HealthPayload {
  readonly version: string;
}

// Utils
export function isHealthPayload(payload: unknown): payload is HealthPayload {
  return !!payload && typeof payload === 'object' && 'version' in payload && typeof payload.version === 'string';
}

// Reference
export function health$(url: URL, logger: Logger, signal: AbortSignal) {
  return pipe$(
    ref$(async () => {
      while (!signal.aborted) {
        const ctrl = new AbortController();
        const timeout = setTimeout(() => ctrl.abort(), 1000);
        const off = once$(dom$<AbortSignalEventMap>(signal), 'abort', () => ctrl.abort());

        try {
          logger.debug`Requesting server health at ${url}`;

          const res = await fetch(url, { signal: ctrl.signal });

          if (res.ok) {
            const payload = await res.json();

            if (isHealthPayload(payload)) {
              return payload;
            } else {
              logger.debug`Server answered but health payload is invalid`;
            }
          } else {
            logger.debug`Server responded with a ${res.status} error: ${await res.text()}`;
          }
        } catch (err) {
          if (!signal.aborted) {
            logger.debug('Error while fetching server health', err as Error);
          }
        } finally {
          off();
          clearTimeout(timeout);
        }

        if (!signal.aborted) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      throw new AbortError('Health loading aborted');
    }),
    dedupeRead$(),
  );
}