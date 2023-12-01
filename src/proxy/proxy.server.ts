import { Inject, inject$, Injectable } from '@jujulego/injector';
import { Flag } from '@jujulego/utils';
import createHttpError from 'http-errors';
import proxy, { ServerOptions } from 'http-proxy';
import { IncomingMessage, ServerResponse } from 'node:http';
import { Duplex, Readable } from 'node:stream';

import { LabelledLogger } from '../logger.config.ts';
import { RedirectionStore } from '../data/redirection.store.ts';

// Proxy server
@Injectable()
export class ProxyServer {
  // Attributes
  private readonly _proxy = proxy.createProxy();
  private readonly _logger = inject$(LabelledLogger('proxy'));

  @Inject(RedirectionStore)
  private readonly _redirections: RedirectionStore;

  // Methods
  private _bodyLength(req: IncomingMessage): number {
    const length = req.headers['content-length'];
    return length ? parseInt(length) : 0;
  }

  async handleRequest(req: IncomingMessage, res: ServerResponse) {
    const redirection = this._redirections.resolve(req.url ?? '');

    // No redirection found
    if (!redirection) {
      this._logger.warn(`${req.url} => unresolved`);
      throw new createHttpError.NotFound('No redirection found');
    }

    // Get outputs
    const outputs = redirection.read().outputs;
    const count = outputs.reduce((cnt, out) => cnt + (out.enabled ? 1 : 0), 0);

    // Save body for future requests
    const buffer = Buffer.allocUnsafe(count > 1 ? this._bodyLength(req) : 0);
    const isComplete = new Flag();

    if (count > 1) {
      let cursor = 0;

      req.on('data', (chunk: Buffer) => {
        cursor += chunk.copy(buffer, cursor);
      });

      req.once('end', () => {
        isComplete.raise();
      });
    }

    // Iterate on outputs
    let first = true;

    for (const output of outputs) {
      if (!output.enabled) {
        continue;
      }

      this._logger.info(`${req.url} => ${output.target} (#${redirection.read().id}.${output.name})`);
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
        this._logger.warn(`#${redirection.read().id}.${output.name} is not responding`);
        redirection.disableOutput(output.name);
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
