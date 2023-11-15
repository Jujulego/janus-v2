import { Inject, inject$, Service } from '@jujulego/injector';
import createHttpError, { isHttpError } from 'http-errors';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';

import { LabelledLogger } from './logger.config.ts';
import { ProxyServer } from './proxy/proxy.server.ts';

// Http server
@Service()
export class HttpServer {
  // Attributes
  private readonly _server = createServer((req, res) => this._handleRequest(req, res));
  private readonly _logger = inject$(LabelledLogger('http'));

  @Inject(ProxyServer)
  private readonly _proxy: ProxyServer;

  // Methods
  listen(port: number) {
    this._server.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));

    this._server.listen(port, () => {
      this._logger.info(`Listening on port ${port}`);
    });
  }

  private async _handleRequest(req: IncomingMessage, res: ServerResponse) {
    try {
      await this._proxy.handleRequest(req, res);
    } catch (err) {
      const httpError = isHttpError(err) ? err : createHttpError(500, err as Error);

      if (httpError.statusCode === 500) {
        this._logger.error('Error while handling request', err as Error);
      }

      res.statusCode = httpError.statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.write(JSON.stringify({
        status: httpError.statusCode,
        message: httpError.message
      }));
      res.end();
    }
  }

  private async _handleUpgrade(req: IncomingMessage, socket: Duplex, head: Buffer) {
    try {
      await this._proxy.handleUpgrade(req, socket, head);
    } catch (err) {
      const httpError = isHttpError(err) ? err : createHttpError(500, err as Error);

      if (httpError.statusCode === 500) {
        this._logger.error('Error while handling request', err as Error);
      }

      const content = JSON.stringify({
        status: httpError.statusCode,
        message: httpError.message
      });

      socket.write(`HTTP/1.1 ${httpError.statusCode} ${httpError.name}\r\n`);
      socket.write(`Content-Length: ${content.length}\r\n`);
      socket.write('Content-Type: application/json\r\n');
      socket.write('\r\n');
      socket.write('\r\n');
      socket.write(content);
    }
  }

  // Properties
  get server() {
    return this._server;
  }
}