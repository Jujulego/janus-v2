import { Logger, withLabel } from '@jujulego/logger';
import { Flag } from '@jujulego/utils';
import createHttpError from 'http-errors';
import proxy, { ServerOptions } from 'http-proxy';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex, Readable } from 'node:stream';

import { disableRedirectionOutput } from '../store/redirections/actions.ts';
import { listEnabledOutputs, resolveRedirection } from '../store/redirections/selectors.ts';
import { ServerStore } from '../store/types.ts';

// Proxy server
export class ProxyServer {
  // Attributes
  private readonly _logger: Logger;
  private readonly _proxy = proxy.createProxy();
  private readonly _store: ServerStore;

  // Constructor
  constructor(logger: Logger, store: ServerStore) {
    this._logger = logger.child(withLabel('proxy'));
    this._store = store;
  }

  // Methods
  private _bodyLength(req: IncomingMessage): number {
    const length = req.headers['content-length'];
    return length ? parseInt(length) : 0;
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const redirection = resolveRedirection(this._store.getState(), req.url!);

    // No redirection found
    if (!redirection) {
      this._logger.warn(`${req.url} => unresolved`);
      throw new createHttpError.NotFound('No redirection found');
    }

    // Save body for future requests
    const buffer = Buffer.allocUnsafe(this._bodyLength(req));
    const isComplete = new Flag();

    let cursor = 0;

    req.on('data', (chunk: Buffer) => {
      cursor += chunk.copy(buffer, cursor);
    });

    req.once('end', () => {
      isComplete.raise();
    });

    // Iterate on outputs
    let first = true;

    for (const output of listEnabledOutputs(redirection)) {
      this._logger.info(`${req.url} => ${output.target} (#${redirection.id}.${output.name})`);
      const options: ServerOptions = { ...output };

      if (!first) {
        await isComplete.waitFor(true);
        options.buffer = Readable.from(buffer);
      } else {
        first = false;
      }

      if (await this._redirectWebTo(req, res, options)) {
        return;
      } else {
        this._logger.warn(`#${redirection.id}.${output.name} is not responding`);
        this._store.dispatch(disableRedirectionOutput({ redirectionId: redirection.id, outputName: output.name }));
      }
    }

    throw new createHttpError.ServiceUnavailable('No outputs available');
  }

  async handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    this._logger.warn('WebSockets not yet handled');

    // TODO: handle websockets
    this._proxy.ws(req, socket, head, { target: 'http://localhost:3001' });
  }

  private _redirectWebTo(req: IncomingMessage, res: ServerResponse, options: ServerOptions): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      res.once('close', () => resolve(true));

      this._proxy.web(req, res, options, (err: NodeJS.ErrnoException) => {
        if (err.code === 'ECONNREFUSED') {
          resolve(false);
        } else {
          reject(err);
        }
      });
    });
  }
}
