import { qjson } from '@jujulego/quick-tag';
import { Logger } from '@kyrielle/logger';
import { readable$, resourceBuilder$ } from 'kyrielle';

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
  return resourceBuilder$<HealthPayload>()
    .add(readable$(async (signal) => {
      logger.debug`Requesting server health at ${url.toString()}`;
      const res = await fetch(url, { signal: signal ?? null });

      if (res.ok) {
        const payload = (await res.json()) as unknown;

        if (isHealthPayload(payload)) {
          return payload;
        } else {
          logger.debug`Server answered but health payload is invalid: ${qjson(payload, { pretty: true })}`;
          throw new Error('Invalid health payload');
        }
      } else {
        logger.debug`Server responded with a ${res.status} error: ${await res.text()}`;
        throw new Error(`Server responded with a ${res.status} error`);
      }
    }))
    .build();

  // return pipe$(
  //   ref$({
  //     async read(signal) {
  //       logger.debug`Requesting server health at ${url.toString()}`;
  //       const res = await fetch(url, { signal: signal ?? null });
  //
  //       if (res.ok) {
  //         const payload = (await res.json()) as unknown;
  //
  //         if (isHealthPayload(payload)) {
  //           return payload;
  //         } else {
  //           logger.debug`Server answered but health payload is invalid: ${qjson(payload, { pretty: true })}`;
  //           throw new Error('Invalid health payload');
  //         }
  //       } else {
  //         logger.debug`Server responded with a ${res.status} error: ${await res.text()}`;
  //         throw new Error(`Server responded with a ${res.status} error`);
  //       }
  //     }
  //   }),
  //   retry$('read', {
  //     tryTimeout: 1000,
  //     async onRetry() {
  //       await waitFor$(timer$(1000));
  //     },
  //   }),
  //   deduplicate$('read'),
  // );
}
