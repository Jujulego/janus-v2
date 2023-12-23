import { Logger, withLabel } from '@jujulego/logger';
import { Inject, inject$ } from '@jujulego/injector';
import { ValidateFunction } from 'ajv';
import { PublicExplorer } from 'cosmiconfig';
import path from 'node:path';

import { Ajv } from '../ajv.config.ts';
import { ConfigExplorer, ConfigValidator } from './utils.ts';
import { Config } from './type.ts';

// Service
export class ConfigService {
  // Attributes
  private _filepath?: string;
  private _config?: Config;

  private readonly _logger: Logger;

  @Inject(ConfigExplorer, { lazy: true })
  private accessor _explorer: PublicExplorer;

  @Inject(ConfigValidator, { lazy: true })
  private accessor _validator: ValidateFunction<Config>;

  // Constructor
  constructor(logger: Logger) {
    this._logger = logger.child(withLabel('config'));
  }

  // Methods
  private _validateConfig(config: unknown): Config {
    if (!this._validator(config)) {
      const ajv = inject$(Ajv);
      const errors = ajv.errorsText(this._validator.errors, { separator: '\n- ', dataVar: 'config' });

      this._logger.error(`Errors in config file:\n- ${errors}`);
      throw new Error('Error in config file');
    }

    // Resolve paths
    Object.assign(config.server, {
      pidfile: path.resolve(config.server.pidfile, this.baseDir)
    });

    return config;
  }

  async searchConfig(): Promise<Config> {
    const loaded = await this._explorer.search();

    if (loaded) {
      this._logger.verbose`Loaded file #!cwd:${loaded.filepath}`;
      this._filepath = loaded.filepath;
      this._config = this._validateConfig(loaded.config);
    } else {
      this._logger.error`No config file found`;
      throw new Error('No config file found');
    }

    return this._config;
  }

  async loadConfig(filepath: string): Promise<Config> {
    const loaded = await this._explorer.load(filepath);

    if (loaded) {
      this._logger.verbose`Loaded file #!cwd:${loaded.filepath}`;
      this._filepath = loaded.filepath;
      this._config = this._validateConfig(loaded.config);
    } else {
      this._logger.error`Config file #!cwd:${filepath} not found`;
      throw new Error('Config file not found');
    }

    return this._config;
  }

  // Attributes
  get config(): Config | undefined {
    return this._config;
  }

  get baseDir(): string {
    return this._filepath ? path.dirname(this._filepath) : process.cwd();
  }
}