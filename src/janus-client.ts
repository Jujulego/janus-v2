import { logger$ } from '@jujulego/logger';

import { ConfigService } from './config/config.service.ts';
import { Config } from './config/type.ts';
import { JanusDaemon } from './janus-daemon.ts';

export class JanusClient {
  // Attributes
  private readonly _configService: ConfigService;

  private _config?: Config;
  private _daemon?: JanusDaemon;

  // Constructor
  constructor(
    readonly logger = logger$(),
    configService?: ConfigService,
  ) {
    this._configService = configService ?? new ConfigService(this.logger);
  }

  // Methods
  /**
   * Searches and load configuration file
   */
  async searchConfig(): Promise<void> {
    this._config = await this._configService.searchConfig();
  }

  /**
   * Loads given configuration file
   *
   * @param filepath Path to configuration file.
   */
  async loadConfig(filepath: string): Promise<void> {
    this._config = await this._configService.loadConfig(filepath);
  }

  /**
   * Starts with loaded config as a daemon.
   *
   * Returns true if daemon successfully started.
   */
  async startProxy(): Promise<boolean> {
    if (this._daemon?.started) {
      this.logger.verbose`Janus proxy already started`;
      return true;
    }

    this._daemon ??= new JanusDaemon(this.logger, this._configService);

    return await this._daemon.fork();
  }
}