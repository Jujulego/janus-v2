import { qjson } from '@jujulego/quick-tag';
import { inject$ } from '@kyrielle/injector';
import { Logger, withLabel } from '@kyrielle/logger';
import Ajv from 'ajv';
import path from 'node:path';
import process from 'node:process';

import schema from './schema.json' assert { type: 'json' };
import { ConfigExplorer } from './config-explorer.js';
import { Config } from './type.js';

// Types
type AjvParser = Ajv.default;
type AjvParserType = new (opts: Ajv.Options) => AjvParser;

export interface ConfigState {
  readonly filepath: string | undefined;
  readonly config: Config | undefined;
}

// Service
export class ConfigService {
  // Attributes
  private _filepath?: string;
  private _config?: Config;

  private readonly _logger: Logger;
  private readonly _explorer = inject$(ConfigExplorer);

  // Constructor
  constructor(logger: Logger, state?: ConfigState) {
    this._logger = logger.child(withLabel('config'));

    if (state?.filepath) { this._filepath = state.filepath; }
    if (state?.config)   { this._config   = state.config;   }
  }

  // Methods
  private _validateConfig(config: unknown): Config {
    // Validate config
    const ajv = new (Ajv as unknown as AjvParserType)({
      allErrors: true,
      useDefaults: true,
      logger: this._logger.child(withLabel('ajv')),
      strict: process.env.NODE_ENV === 'development' ? 'log' : true,
    });

    const validator = ajv.compile<Config>(schema);

    if (!validator(config)) {
      const errors = ajv.errorsText(validator.errors, { separator: '\n- ', dataVar: 'config' });

      this._logger.error(`Errors in config file:\n- ${errors}`);
      throw new Error('Error in config file');
    }

    // Resolve paths
    Object.assign(config.server, {
      pidfile: path.resolve(this.baseDir, config.server.pidfile),
      logfile: path.resolve(this.baseDir, config.server.logfile),
    });

    this._logger.debug`Loaded config:\n${qjson(config, { pretty: true })}`;

    return config;
  }

  async searchConfig(): Promise<Config> {
    const loaded = await this._explorer.search();

    if (loaded) {
      this._logger.verbose`Loaded file ${loaded.filepath}`;
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
      this._logger.verbose`Loaded file ${loaded.filepath}`;
      this._filepath = loaded.filepath;
      this._config = this._validateConfig(loaded.config);
    } else {
      this._logger.error`Config file ${filepath} not found`;
      throw new Error('Config file not found');
    }

    return this._config;
  }

  // Attributes
  get baseDir(): string {
    return this._filepath ? path.dirname(this._filepath) : process.cwd();
  }

  get config(): Config | undefined {
    return this._config;
  }

  get state(): ConfigState {
    return {
      filepath: this._filepath,
      config: this.config
    };
  }
}
