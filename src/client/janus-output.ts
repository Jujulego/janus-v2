import { logger$ } from '@kyrielle/logger';
import { pipe$, retry$, timeout$ } from 'kyrielle';
import assert from 'node:assert';

import { ConfigService } from '../config/config.service.js';
import { Config, OutputConfig, RedirectionConfig } from '../config/type.js';
import { generateRedirectionId } from '../utils/redirections.js';
import { graphql } from './gql/index.js';
import { JanusClient } from './janus-client.js';

// Types
export interface JanusOutputOptions {
  configFile?: string;
}

/**
 * Manages a given output.
 */
export class JanusOutput implements Disposable {
  // Attributes
  readonly logger = logger$();
  readonly redirectionId: string;
  readonly [Symbol.dispose]: () => void;

  private _client?: JanusClient;
  private _config?: Config;

  private readonly _configService = new ConfigService(this.logger);

  // Constructor
  constructor(
    readonly redirectionUrl: string,
    readonly outputName: string,
    readonly options: JanusOutputOptions = {},
  ) {
    this.redirectionId = generateRedirectionId(this.redirectionUrl);

    this[Symbol.dispose ?? Symbol.for('Symbol.dispose')] = this.dispose.bind(this);
  }

  // Methods
  private async _getConfig(): Promise<Config> {
    if (!this._config) {
      if (this.options?.configFile) {
        this._config = await this._configService.loadConfig(this.options.configFile);
      } else {
        this._config = await this._configService.searchConfig();
      }
    }

    return this._config;
  }

  private async _getClient(): Promise<JanusClient> {
    if (!this._client) {
      const config = await this._getConfig();
      this._client = new JanusClient(`http://localhost:${config.server.port}/`, this.logger);
    }

    return this._client;
  }

  private async _getRedirectionOutput(): Promise<{ redirection: RedirectionConfig, output: OutputConfig }> {
    const config = await this._getConfig();

    // Search redirection
    const redirection = config.redirections[this.redirectionUrl];

    if (!redirection) {
      throw new Error(`No redirection configured at ${this.redirectionUrl}`);
    }

    // Search output
    const output = redirection.outputs[this.outputName];

    if (!output) {
      throw new Error(`No output ${this.outputName} found at ${this.redirectionUrl}`);
    }

    return { redirection, output };
  }

  /**
   * Enables output in server
   * @param signal
   */
  async enable(signal?: AbortSignal): Promise<void> {
    await this._getRedirectionOutput(); // <= asserts that output exists according to config
    const client = await this._getClient();

    this.logger.info('Enabling redirection output...');
    const { data: result } = await pipe$(
      client.request$(
        graphql(`
          mutation EnableJanusOutput($redirectionId: ID!, $outputName: String!) {
            enableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
              id
            }
          }
        `),
        { redirectionId: this.redirectionId, outputName: this.outputName }
      ),
      retry$('read', {
        tryTimeout: 1000,
        onRetry: () => timeout$(1000),
      }),
    ).read(signal);

    assert(result?.enableRedirectionOutput?.id === this.redirectionId, 'Janus server responded with wrong redirection id');
  }

  /**
   * Disables output in server
   * @param signal
   */
  async disable(signal?: AbortSignal): Promise<void> {
    await this._getRedirectionOutput(); // <= asserts that output exists according to config
    const client = await this._getClient();

    this.logger.info('Disabling redirection output...');
    const { data: result } = await pipe$(
      client.request$(
        graphql(`
          mutation DisableJanusOutput($redirectionId: ID!, $outputName: String!) {
            disableRedirectionOutput(redirectionId: $redirectionId, outputName: $outputName) {
              id
            }
          }
        `),
        { redirectionId: this.redirectionId, outputName: this.outputName }
      ),
      retry$('read', {
        tryTimeout: 1000,
        onRetry: () => timeout$(1000),
      }),
    ).read(signal);

    assert(result?.disableRedirectionOutput?.id === this.redirectionId, 'Janus server responded with wrong redirection id');
  }

  /**
   * Disposes internal resources
   */
  dispose(): void {
    this._client?.dispose();
    delete this._client;
  }
}
