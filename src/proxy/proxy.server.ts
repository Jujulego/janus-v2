import { Inject, inject$, Service } from '@jujulego/injector';
import http from 'node:http';
import stream from 'node:stream';
import proxy from 'http-proxy';

import { LabelledLogger } from '../logger.config.ts';
import { RedirectionStore } from '../data/redirection.store.ts';
import { RedirectionOutput } from '../data/redirection.js';

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

  private async _handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    try {
      const redirection = this._redirections.resolve(req.url ?? '');

      if (!redirection) {
        this._logger.warn(`${req.url} => unresolved`);
        this._send(res, 404, { message: 'No redirection found' });

        return;
      }

      for (const [name, output] of Object.entries(redirection.outputs)) {
        if (!output.enabled) {
          continue;
        }

        this._logger.info(`${req.url} => ${output.target} (#${redirection.id}.${name})`);

        if (await this._redirectWebTo(req, res, output)) {
          return;
        } else {
          this._logger.warn(`#${redirection.id}.${name} is not responding`);
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

  private _redirectWebTo(req: http.IncomingMessage, res: http.ServerResponse, output: RedirectionOutput): Promise<boolean> {
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
}