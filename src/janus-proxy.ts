import { Logger, logger$ } from '@jujulego/logger';
import { PidFile } from '@jujulego/pid-file';
import { Lock } from '@jujulego/utils';
import { Listenable, source$ } from 'kyrielle';
import { multiplexer$ } from 'kyrielle/events';
import process from 'node:process';

import { ConfigService } from './config/config.service.ts';
import { Config } from './config/type.ts';
import { HttpServer } from './server/http.server.ts';
import { StateHolder } from './state/state-holder.ts';

// Types
export type JanusProxyEventMap = {
  loaded: Config;
  started: JanusProxy;
}

export class JanusProxy implements Listenable<JanusProxyEventMap> {
  // Attributes
  readonly logger: Logger;

  private readonly _configService: ConfigService;
  private readonly _state: StateHolder;
  private readonly _server: HttpServer;

  private _config?: Config;
  private _pidfile?: PidFile;
  private _started = false;
  private readonly _lock = new Lock();
  private readonly _events = multiplexer$({
    loaded: source$<Config>(),
    started: source$<JanusProxy>(),
  });

  // Constructor
  constructor(
    logger: Logger = logger$(),
    configService?: ConfigService,
  ) {
    this.logger = logger;

    this._configService = configService ?? new ConfigService(this.logger);
    this._state = new StateHolder(this.logger);
    this._server = new HttpServer(this.logger, this._state);

    if (configService?.config) {
      this._config = configService?.config;
    }
  }

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

    this._pidfile ??= new PidFile(this._config.server.pidfile, this.logger);

    await this._lock.with(async () => {
      if (this._started) {
        return;
      }

      // Create pid file to ensure only one instance of janus is running
      if (await this._pidfile!.create()) {
        // Load redirections & start server
        this._state.redirections.fromConfig(this._config!);
        await this._server.listen(this._config!);

        this._started = true;
        this._events.emit('started', this);

        process.on('beforeExit', () => this._pidfile?.delete());
      } else {
        this.logger.warn('Looks like janus is already running.');
      }
    });
  }

  // Properties
  get started() {
    return this._started;
  }
}