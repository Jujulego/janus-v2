import { Logger, logger$, withLabel } from '@kyrielle/logger';
import { Client, createClient } from 'graphql-sse';
import { AsyncReadable } from 'kyrielle';

import { health$, HealthPayload } from './health.ref.ts';

// Class
export class JanusClient implements Disposable {
  // Attributes
  private _sseClient: Client<true> | null = null;
  private _healthController = new AbortController();

  readonly logger: Logger;
  readonly serverHealth$: AsyncReadable<HealthPayload>;

  // Constructor
  constructor(
    readonly janusUrl = 'http://localhost:3000/',
    logger = logger$(),
  ) {
    this.logger = logger.child(withLabel('janus'));

    this.serverHealth$ = health$(
      new URL('/_janus/health', janusUrl),
      this.logger.child(withLabel('janus:health')),
    );
  }

  // Methods
  /**
   * Connects client to server, and setup healthcheck.
   * @returns `true` if connection is successful, `false` otherwise.
   */
  async initiate(signal?: AbortSignal): Promise<HealthPayload> {
    const health = await this.serverHealth$.read(signal);

    if (!this._sseClient) {
      this.logger.verbose`Janus client connected (server version: ${health.version})`;

      this._sseClient = createClient({
        lazy: true,
        singleConnection: true,
        url: new URL('/_janus/graphql/stream', this.janusUrl).toString(),
        retry: async () => {
          await this.serverHealth$.read(this._healthController.signal);
        },
      });
    }

    return health;
  }

  /**
   * Dispose all resources connected with the server
   */
  dispose(): void {
    this._healthController.abort();

    if (this._sseClient) {
      this._sseClient.dispose();
      this._sseClient = null;
    }
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
