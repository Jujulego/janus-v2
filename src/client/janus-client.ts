import { Log, Logger, logger$, LogLabel, withLabel } from '@jujulego/logger';
import { Client, createClient } from 'graphql-sse';
import { AsyncRef } from 'kyrielle';

import { health$, HealthPayload } from './health.ref.ts';
import { once$ } from 'kyrielle/subscriptions';
import { dom$ } from 'kyrielle/browser';

// Class
export class JanusClient implements Disposable {
  // Attributes
  private _sseClient: Client<true> | null = null;
  private _healthController = new AbortController();

  readonly logger: Logger<Log & LogLabel>;
  readonly serverHealth$: AsyncRef<HealthPayload>;

  // Constructor
  constructor(
    readonly janusUrl = 'http://localhost:3000/',
    logger = logger$(),
  ) {
    this.logger = logger.child(withLabel('janus'));

    this.serverHealth$ = health$(
      new URL('/_janus/health', janusUrl),
      this.logger.child(withLabel('janus:health')),
      this._healthController.signal,
    );
  }

  // Methods
  /**
   * Connects client to server, and setup healthcheck.
   * @returns `true` if connection is successful, `false` otherwise.
   */
  async initiate(signal?: AbortSignal): Promise<HealthPayload> {
    const off = signal && once$(dom$<AbortSignalEventMap>(signal), 'abort', () => this.dispose());

    try {
      const health = await this.serverHealth$.read();

      if (!this._sseClient) {
        this.logger.verbose`Janus client connected (server version: ${health.version})`;

        this._sseClient = createClient({
          lazy: true,
          singleConnection: true,
          url: new URL('/_janus/graphql/stream', this.janusUrl).toString(),
          retry: async () => {
            await this.serverHealth$.read();
          },
        });
      }

      return health;
    } finally {
      off?.();
    }
  }

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
