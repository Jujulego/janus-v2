import { logger$ } from '@jujulego/logger';
import { Client, createClient } from 'graphql-sse';
import { Listenable, source$ } from 'kyrielle';
import { multiplexer$ } from 'kyrielle/events';
import { waitFor$ } from 'kyrielle/subscriptions';

import { HealthPayload, isHealthPayload } from './dto/health.js';

// Types
export type JanusClientEventMap = {
  connected: HealthPayload;
  disconnected: true;
}

// Class
export class JanusClient implements Listenable<JanusClientEventMap> {
  // Attributes
  private _connected = false;
  private _client?: Client<true>;
  private _healthcheckTimeout?: number | NodeJS.Timeout;

  private readonly _events = multiplexer$({
    connected: source$<HealthPayload>(),
    disconnected: source$<true>(),
  });

  // Constructor
  constructor(
    readonly janusUrl = 'http://localhost:3000/',
    readonly logger = logger$(),
  ) {}

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly eventKeys = this._events.eventKeys;
  readonly clear = this._events.clear;

  private async _getServerHealth() {
    try {
      const healthUrl = new URL('/_janus/health', this.janusUrl);
      this.logger.debug`Requesting server health at ${healthUrl}`;

      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(1000) });

      if (res.ok) {
        const payload = await res.json();

        if (isHealthPayload(payload)) {
          this.logger.debug`Janus server reached (${payload})`;
          return payload;
        } else {
          this.logger.warn`Server answered but health payload is invalid`;
        }
      } else {
        this.logger.warn`Server responded with a ${res.status} error: ${await res.text()}`;
      }
    } catch (err) {
      if (err instanceof DOMException) {
        if (err.name === 'TimeoutError') {
          this.logger.warn`Server did not respond in time`;
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    return null;
  }

  private _runHealthcheck = async () => {
    const health = await this._getServerHealth();

    if (!health && this._connected) {
      this._connected = false;
      this._events.emit('disconnected', true);
    }

    if (health && !this._connected) {
      this._connected = true;
      this._events.emit('connected', health);
    }

    this._healthcheckTimeout = setTimeout(this._runHealthcheck, 1000);
  };

  /**
   * Connects client to server, and setup healthcheck.
   * @returns `true` if connection is successful, `false` otherwise.
   */
  async connect(): Promise<boolean> {
    if (this._connected) {
      return true;
    }

    const health = await this._getServerHealth();

    if (health) {
      this.logger.verbose`Janus client connected (server version: ${health.version})`;

      this._client = createClient({
        lazy: true,
        singleConnection: true,
        url: new URL('/_janus/graphql/stream', this.janusUrl).toString(),
        retry: async () => {
          await waitFor$(this, 'connected');
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 3000));
        },
      });

      this._connected = true;
      this._events.emit('connected', health);

      this._healthcheckTimeout = setTimeout(this._runHealthcheck, 1000);

      return true;
    } else {
      return false;
    }
  }

  disconnect(): void {
    if (this._healthcheckTimeout) {
      clearTimeout(this._healthcheckTimeout);
    }

    this._client?.dispose();
    this._connected = false;
  }
}
