import { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { Logger, logger$, withLabel } from '@kyrielle/logger';
import { DocumentNode, FormattedExecutionResult, OperationDefinitionNode, print } from 'graphql';
import { Client, createClient, ExecutionResult, RequestParams } from 'graphql-sse';
import { AsyncReadable, type Observable, observable$, type Readable, readable$, var$ } from 'kyrielle';

import { health$, HealthPayload } from './health.ref.js';

// Type
export type JanusClientStatus = 'connecting' | 'connected' | 'disconnected';

// Class
export class JanusClient implements Disposable {
  // Attributes
  private readonly _sseClient: Client<false>;
  private readonly _healthController = new AbortController();

  readonly logger: Logger;
  readonly serverHealth$: AsyncReadable<HealthPayload>;
  readonly status$ = var$<JanusClientStatus>('disconnected');
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
        this.status$.mutate('connecting');
        await this.serverHealth$.read(this._healthController.signal);
      },
      on: {
        connecting: (reconnecting) => {
          this.status$.mutate('connecting');
          this.logger.debug`${reconnecting ? 'Reconnecting' : 'Connecting'} to sse stream`;
        },
        connected: (reconnected) => {
          this.status$.mutate('connected');
          this.logger.debug`${reconnected ? 'Reconnected' : 'Connected'} to sse stream`;
        },
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
   * Send a request to the server
   */
  request$<D>(document: TypedDocumentNode<D, Record<string, never>>): Readable<Promise<FormattedExecutionResult<D>>>;
  request$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables: V): Readable<Promise<FormattedExecutionResult<D>>>;
  request$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables?: V): Readable<Promise<FormattedExecutionResult<D>>> {
    return readable$(async (signal) => {
      const query = this._prepareQuery(document, variables);
      this.logger.debug`Sending ${query.operationName ?? 'graphql'} request to server at ${this.janusUrl}`;

      const res = await fetch(new URL('/_janus/graphql', this.janusUrl), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(query),
        signal,
      });

      return await res.json();
    });
  }

  /**
   * Subscribes to an event stream
   */
  subscribe$<D>(document: TypedDocumentNode<D, Record<string, never>>): Observable<ExecutionResult<D>>;
  subscribe$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables: V): Observable<ExecutionResult<D>>;
  subscribe$<D, V extends Record<string, unknown>>(document: TypedDocumentNode<D, V>, variables?: V): Observable<ExecutionResult<D>> {
    return observable$<ExecutionResult<D>>((observer, signal) => {
      const query = this._prepareQuery(document, variables);
      this.logger.debug`Sending ${query.operationName ?? 'graphql'} subscription to server at ${this.janusUrl}`;

      const off = this._sseClient.subscribe<D>(query, observer);
      signal.addEventListener('abort', off, { once: true });
    });
  }

  /**
   * Dispose all resources connected with the server
   */
  dispose(): void {
    this._healthController.abort();
    this._sseClient.dispose();

    this.status$.mutate('disconnected');
    this.logger.verbose`Janus client disconnected`;
  }
}
