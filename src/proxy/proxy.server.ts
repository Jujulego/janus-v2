import { Inject, inject$, Service } from '@jujulego/injector';
import { Flag } from '@jujulego/utils';
import http from 'node:http';
import stream from 'node:stream';
import proxy, { ServerOptions } from 'http-proxy';

import { LabelledLogger } from '../logger.config.ts';
import { RedirectionStore } from '../data/redirection.store.ts';

// Proxy server
@Service()
export class ProxyServer {
  // Attributes
  private readonly _proxy = proxy.createProxy();
  private readonly _server = http.createServer((req, res) => this._handleRequest(req, res));
  private readonly _logger = inject$(LabelledLogger('proxy'));

  @Inject(RedirectionStore)
  private readonly _redirections: RedirectionStore;

  // Methods
  listen(port: number) {
    this._server.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));

    this._server.listen(port, () => {
      this._logger.info(`Listening on port ${port}`);
    });
  }

  private _bodyLength(req: http.IncomingMessage): number {
    const length = req.headers['content-length'];
    return length ? parseInt(length) : 0;
  }

  private async _handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      const redirection = this._redirections.resolve(req.url ?? '');

      // No redirection found
      if (!redirection) {
        this._logger.warn(`${req.url} => unresolved`);
        this._send(res, 404, { message: 'No redirection found' });

        return;
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
          options.buffer = stream.Readable.from(buffer);
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

      this._send(res, 503, { message: 'No outputs available' });
    } catch (err) {
      this._logger.error('Error while redirecting request', err as Error);
      this._send(res, 500, { message: 'Error while redirecting request', error: err });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _handleUpgrade(req: http.IncomingMessage, socket: stream.Duplex, head: Buffer) {
    this._logger.warn('WebSockets not yet handled');
    socket.end();

    // TODO: handle websockets
    // this._proxy.ws(req, socket, head, { target: 'http://localhost:3001' });
  }

  private _redirectWebTo(req: http.IncomingMessage, res: http.ServerResponse, output: ServerOptions): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      res.once('close', () => resolve(true));

      this._proxy.web(req, res, output, (err: NodeJS.ErrnoException) => {
        if (err.code === 'ECONNREFUSED') {
          resolve(false);
        } else {
          reject(err);
        }
      });
    });
  }

  private _send(res: http.ServerResponse, status: number, content: object) {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify(content));
    res.end();
  }

  // Properties
  get server() {
    return this._server;
  }
}
