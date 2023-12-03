import { inject$ } from '@jujulego/injector';
import { Lock } from '@jujulego/utils';
import { Listenable, source$ } from 'kyrielle';
import { multiplexer$ } from 'kyrielle/events';

import { RedirectionStore } from './state/redirection.store.ts';
import { HttpServer } from './http.server.ts';

// Types
export type JanusProxyEventMap = {
  started: JanusProxy;
}

export class JanusProxy implements Listenable<JanusProxyEventMap> {
  // Attributes
  private readonly _redirections = inject$(RedirectionStore);
  private readonly _server = inject$(HttpServer);

  private _started = false;
  private readonly _lock = new Lock();
  private readonly _events = multiplexer$({
    started: source$<JanusProxy>()
  });

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;
  readonly eventKeys = this._events.eventKeys;

  async start(): Promise<void> {
    await this._lock.with(async () => {
      if (this._started) {
        return;
      }

      // Load redirections & start server
      await this._redirections.loadConfig();
      await this._server.listen();

      this._started = true;
      this._events.emit('started', this);
    });
  }

  // Properties
  get started() {
    return this._started;
  }
}