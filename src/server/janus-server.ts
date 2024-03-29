import { PidFile } from '@jujulego/pid-file';
import { Lock } from '@jujulego/utils';
import { logger$, withTimestamp } from '@kyrielle/logger';
import { Listenable, multiplexer$, source$ } from 'kyrielle';
import process from 'node:process';

import { ConfigService } from '../config/config.service.js';
import { Config } from '../config/type.js';
import { LogFile } from './log-file.js';
import { HttpServer } from './http.server.js';
import { serverStore } from './store/server.store.js';
import { loadConfig } from './store/actions.js';
import { ServerStore } from './store/types.js';

// Types
export type JanusProxyEventMap = {
  loaded: Config;
  started: JanusServer;
}

export class JanusServer implements Listenable<JanusProxyEventMap> {
  // Attributes
  private readonly _configService: ConfigService;
  private readonly _server: HttpServer;
  private readonly _store: ServerStore;

  private _config?: Config;
  private _pidfile?: PidFile;
  private _started = false;
  private readonly _logfile = new LogFile();
  private readonly _lock = new Lock();
  private readonly _events = multiplexer$({
    loaded: source$<Config>(),
    started: source$<JanusServer>(),
  });

  // Constructor
  constructor(
    readonly logger = logger$(withTimestamp()),
    configService?: ConfigService,
  ) {
    this._configService = configService ?? new ConfigService(this.logger);
    this._store = serverStore(this.logger);
    this._server = new HttpServer(this.logger, this._store);

    if (configService?.config) {
      this._config = configService?.config;
      this._setupLogFile();
    }
  }

  // Methods
  readonly on = this._events.on;

  private _setupLogFile() {
    this._logfile.open(this._config!.server.logfile, this.logger);
  }

  /**
   * Searches and load configuration file
   */
  async searchConfig(): Promise<void> {
    this._config = await this._configService.searchConfig();
    this._setupLogFile();

    this._events.emit('loaded', this._config);
  }

  /**
   * Loads given configuration file
   *
   * @param filepath Path to configuration file.
   */
  async loadConfig(filepath: string): Promise<void> {
    this._config = await this._configService.loadConfig(filepath);
    this._setupLogFile();

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
        this._store.dispatch(loadConfig(this._config!));
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
