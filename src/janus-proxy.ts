import { logger$, withTimestamp } from '@jujulego/logger';
import { Lock } from '@jujulego/utils';
import { Listenable, source$ } from 'kyrielle';
import { multiplexer$ } from 'kyrielle/events';

import { ConfigService } from './config/config.service.ts';
import { Config } from './config/type.ts';
import { HttpServer } from './server/http.server.ts';
import { StateHolder } from './state/state.holder.ts';

// Types
export type JanusProxyEventMap = {
  loaded: Config;
  started: JanusProxy;
}

export class JanusProxy implements Listenable<JanusProxyEventMap> {
  // Attributes
  readonly logger = logger$(withTimestamp());

  private readonly _configService = new ConfigService(this.logger);
  private readonly _state = new StateHolder(this.logger);
  private readonly _server = new HttpServer(this.logger, this._state);

  private _config?: Config;
  private _started = false;
  private readonly _lock = new Lock();
  private readonly _events = multiplexer$({
    loaded: source$<Config>(),
    started: source$<JanusProxy>(),
  });

  // Methods
  readonly on = this._events.on;
  readonly off = this._events.off;
  readonly clear = this._events.clear;
  readonly eventKeys = this._events.eventKeys;

  /**
   * Searches and load configuration file
   */
  async searchConfig(): Promise<void> {
    this._config = await this._configService.searchConfig();
    this._events.emit('loaded', this._config);
  }

  /**
   * Loads given configuration file
   *
   * @param filepath Path to configuration file.
   */
  async loadConfig(filepath: string): Promise<void> {
    this._config = await this._configService.loadConfig(filepath);
    this._events.emit('loaded', this._config);
  }

  /**
   * Starts proxy server (only if configuration has been loaded)
   */
  async start(): Promise<void> {
    if (!this._config) {
      throw new Error('Configuration not yet loaded');
    }

    await this._lock.with(async () => {
      if (this._started) {
        return;
      }

      // Load redirections & start server
      this._state.redirections.fromConfig(this._config!);
      await this._server.listen(this._config!);

      this._started = true;
      this._events.emit('started', this);
    });
  }

  // Properties
  get started() {
    return this._started;
  }
}