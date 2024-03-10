import { qjson } from '@jujulego/quick-tag';
import { Logger } from '@kyrielle/logger';
import { pipe$, retry$, timeout$ } from 'kyrielle';
import { fetch$ } from '../utils/fetch.js';
import { validate$ } from '../utils/validate.js';

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
    fetch$(url, {
      onFetch: (url) => logger.debug`Requesting server health at ${url.toString()}`
    }),
    retry$('read', {
      tryTimeout: 1000,
      onRetry: () => timeout$(1000),
    }),
    validate$(isHealthPayload, {
      onMiss(payload): never {
        logger.warn`Server answered but health payload is invalid: ${qjson(payload, { pretty: true })}`;
        throw new Error('Invalid health payload');
      }
    })
  );
}
