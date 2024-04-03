import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Logger, logger$, withLabel } from '@kyrielle/logger';
import { DocumentNode, FormattedExecutionResult, OperationDefinitionNode, print } from 'graphql';
import { Client, createClient, ExecutionResult, RequestParams } from 'graphql-sse';
import { AsyncReadable, type Observable, observable$ } from 'kyrielle';
import assert from 'node:assert';

import { health$, HealthPayload } from './health.ref.js';

// Types
export interface OperationOptions {
  readonly variables?: Record<string, unknown>;
  readonly signal?: AbortSignal;
}

// Class
export class JanusClient implements Disposable {
  // Attributes
  private _sseClient: Client<false> | null = null;
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

      const url = new URL('/_janus/graphql', this.janusUrl).toString();
      this.logger.debug`Initiate sse client against ${url}`;

      this._sseClient = createClient({
        url,
        retry: async () => {
          await this.serverHealth$.read(this._healthController.signal);
        },
        on: {
          connecting: () => this.logger.debug`Connecting to sse stream`,
          message: (message) => this.logger.debug`Sending ${message.event} to sse stream`,
          connected: () => this.logger.debug`Connected to sse stream`,
        }
      });
    }

    return health;
  }

  /**
   * Send query to the server
   */
  async send<R, V>(document: TypedDocumentNode<R, V>, opts: OperationOptions = {}): Promise<FormattedExecutionResult<R>> {
    const query = this._prepareQuery(document, opts.variables);
    this.logger.debug`Sending ${query.operationName ?? 'graphql'} request to server at ${this.janusUrl}`;

    const res = await fetch(new URL('/_janus/graphql', this.janusUrl), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(query),
      signal: opts.signal ?? null,
    });

    return await res.json();
  }

  /**
   * Subscribes to an event stream
   */
  subscribe$<D>(document: TypedDocumentNode<D, Record<string, never>>): Observable<ExecutionResult<D>>;
  subscribe$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables: V): Observable<ExecutionResult<D>>;
  subscribe$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables?: V): Observable<ExecutionResult<D>> {
    assert(!!this._sseClient, 'Client should be initiated before any observe call');

    return observable$<ExecutionResult<D>>((observer, signal) => {
      const off = this._sseClient!.subscribe<D>(this._prepareQuery(document, variables), observer);
      signal.addEventListener('abort', off, { once: true });
    });
  }

  /**
   * Dispose all resources connected with the server
   */
  dispose(): void {
    this._healthController.abort();

    if (this._sseClient) {
      this._sseClient.dispose();
      this._sseClient = null;

      this.logger.verbose`Janus client disconnected`;
    }
  }
}
