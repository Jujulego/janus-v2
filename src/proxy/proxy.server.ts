import { inject$, Service } from '@jujulego/injector';
import http from 'node:http';
import stream from 'node:stream';
import proxy from 'http-proxy';

import { LabelledLogger } from '../logger.config.js';

// Proxy server
@Service()
export class ProxyServer {
  // Attributes
  private readonly _proxy = proxy.createProxy();
  private readonly _server = http.createServer((req, res) => this._handleRequest(req, res));
  private readonly _logger = inject$(LabelledLogger('proxy'));

  // Methods
  listen(port: number) {
    this._server.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));

    this._server.listen(port, () => {
      this._logger.info(`Listening on port ${port}`);
    });
  }

  private _handleRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    this._proxy.web(req, res, { target: 'http://localhost:3001' });
  }

  private _handleUpgrade(req: http.IncomingMessage, socket: stream.Duplex, head: Buffer) {
    this._proxy.ws(req, socket, head, { target: 'http://localhost:3001' });
  }
}