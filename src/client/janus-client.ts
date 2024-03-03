import { Logger, logger$, withLabel } from '@kyrielle/logger';
import { DocumentNode, FormattedExecutionResult, OperationDefinitionNode, print } from 'graphql';
import { Client, createClient, ExecutionResult, RequestParams } from 'graphql-sse';
import { AsyncReadable, Observer } from 'kyrielle';
import assert from 'node:assert';

import { health$, HealthPayload } from './health.ref.ts';

// Types
export interface OperationOptions {
  readonly variables?: Record<string, unknown>;
  readonly signal?: AbortSignal;
}

// Class
export class JanusClient implements Disposable {
  // Attributes
  private _sseClient: Client<true> | null = null;
  private _healthController = new AbortController();

  readonly logger: Logger;
  readonly serverHealth$: AsyncReadable<HealthPayload>;
  readonly [Symbol.dispose]: () => void;

  // Constructor
  constructor(
    readonly janusUrl = 'http://localhost:3000/',
    logger = logger$(),
  ) {
    this.logger = logger.child(withLabel('janus'));

    this.serverHealth$ = health$(
      new URL('/_janus/health', janusUrl),
      this.logger.child(withLabel('janus:health')),
    );

    this[Symbol.dispose ?? Symbol.for('Symbol.dispose')] = this.dispose.bind(this);
  }

  // Methods
  private _prepareQuery(document: DocumentNode, variables?: Record<string, unknown>): RequestParams {
    const operation = document.definitions
      .find((def): def is OperationDefinitionNode => def.kind === 'OperationDefinition');

    const request: RequestParams = { query: print(document) };

    if (operation?.name?.value) {
      request.operationName = operation.name.value;
    }

    if (variables) {
      request.variables = variables;
    }

    return request;
  }

  /**
   * Connects client to server, and setup healthcheck.
   * @returns `true` if connection is successful, `false` otherwise.
   */
  async initiate(signal?: AbortSignal): Promise<HealthPayload> {
    const health = await this.serverHealth$.read(signal);

    if (!this._sseClient) {
      this.logger.verbose`Janus client connected (server version: ${health.version})`;

      this._sseClient = createClient({
        lazy: true,
        singleConnection: true,
        url: new URL('/_janus/graphql/stream', this.janusUrl).toString(),
        retry: async () => {
          await this.serverHealth$.read(this._healthController.signal);
        },
      });
    }

    return health;
  }

  /**
   * Send query to the server
   */
  async send<R>(document: DocumentNode, opts: OperationOptions = {}): Promise<FormattedExecutionResult<R>> {
    const res = await fetch(new URL('/_janus/graphql', this.janusUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(this._prepareQuery(document, opts.variables)),
      signal: opts.signal ?? null,
    });

    return await res.json();
  }

  /**
   * Subscribes to an event stream
   */
  subscribe<D>(observer: Observer<ExecutionResult<D>>, document: DocumentNode, opts: OperationOptions = {}): void {
    assert(!!this._sseClient, 'Client should be initiated before any observe call');

    const off = this._sseClient.subscribe<D>(this._prepareQuery(document, opts.variables), observer);

    if (opts.signal) {
      opts.signal.addEventListener('abort', off, { once: true });
    }
  }

  /**
   * Dispose all resources connected with the server
   */
  dispose(): void {
    this._healthController.abort();

    if (this._sseClient) {
      this._sseClient.dispose();
      this._sseClient = null;
    }
  }
}
