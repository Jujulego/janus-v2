import { qjson } from '@jujulego/quick-tag';
import { Logger } from '@kyrielle/logger';
import { fetch$, pipe$, retry$, timeout$, validate$ } from 'kyrielle';

// Type
export interface HealthPayload {
  readonly pid: number;
  readonly version: string;
}

// Utils
export function isHealthPayload(payload: unknown): payload is HealthPayload {
  return !!payload && typeof payload === 'object'
    && 'pid' in payload && typeof payload.pid === 'number'
    && 'version' in payload && typeof payload.version === 'string';
}

// Reference
export function health$(url: URL, logger: Logger) {
  return pipe$(
    fetch$<unknown>(url, {
      onFetch: (url) => logger.debug`Requesting server health at ${url.toString()}`,
      onSuccess: (res) => res.json(),
    }),
    retry$('defer', {
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
