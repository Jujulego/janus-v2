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
  private readonly _sseClient: Client<false>;
  private readonly _healthController = new AbortController();

  readonly logger: Logger;
  readonly serverHealth$: AsyncReadable<HealthPayload>;
  readonly [Symbol.dispose]: () => void;

  // Constructor
  constructor(
    readonly janusUrl = 'http://localhost:3000/',
    logger = logger$(),
  ) {
    this.logger = logger.child(withLabel('janus:client'));

    this.serverHealth$ = health$(
      new URL('/_janus/health', janusUrl),
      this.logger.child(withLabel('janus:health')),
    );

    this._sseClient = this._prepareClient();

    this[Symbol.dispose ?? Symbol.for('Symbol.dispose')] = this.dispose.bind(this);
  }

  // Methods
  private _prepareClient(): Client<false> {
    const url = new URL('/_janus/graphql', this.janusUrl).toString();
    this.logger.debug`Initiate sse client against ${url}`;

    return createClient({
      url,
      retry: async () => {
        await this.serverHealth$.read(this._healthController.signal);
      },
      on: {
        connecting: (reconnecting) => this.logger.debug`${reconnecting ? 'Reconnecting' : 'Connecting'} to sse stream`,
        connected: (reconnected) => this.logger.debug`${reconnected ? 'Reconnected' : 'Connected'} to sse stream`,
      }
    });
  }

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
      const query = this._prepareQuery(document, variables);
      this.logger.debug`Sending ${query.operationName ?? 'graphql'} subscription to server at ${this.janusUrl}`;

      const off = this._sseClient!.subscribe<D>(query, observer);
      signal.addEventListener('abort', off, { once: true });
    });
  }

  /**
   * Dispose all resources connected with the server
   */
  dispose(): void {
    this._healthController.abort();
    this._sseClient.dispose();

    this.logger.verbose`Janus client disconnected`;
  }
}
