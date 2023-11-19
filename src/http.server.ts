import { Inject, inject$, Service } from '@jujulego/injector';
import createHttpError, { isHttpError } from 'http-errors';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';

import { YogaServer } from './control/yoga.server.ts';
import { LabelledLogger } from './logger.config.ts';
import { ProxyServer } from './proxy/proxy.server.ts';
import { renderHttpError, sendHttpError } from './utils/http-error.ts';

// Http server
@Service()
export class HttpServer {
  // Attributes
  private readonly _server = createServer((req, res) => this._handleRequest(req, res));
  private readonly _logger = inject$(LabelledLogger('http'));
  private readonly _yoga = inject$(YogaServer);

  @Inject(ProxyServer)
  private readonly _proxy: ProxyServer;

  // Methods
  listen(port: number) {
    this._server.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));

    this._server.listen(port, () => {
      this._logger.info(`Listening on port ${port}`);
    });
  }

  private async _handleRequest(req: IncomingMessage | Request, res: ServerResponse) {
    try {
      if (req.url?.startsWith('/_janus')) {
        await this._yoga(req as Request, res);
      } else {
        await this._proxy.handleRequest(req as IncomingMessage, res);
      }
    } catch (err) {
      const httpError = isHttpError(err) ? err : createHttpError(500, err as Error);

      if (httpError.statusCode === 500) {
        this._logger.error('Error while handling request', err as Error);
      }

      sendHttpError(res, httpError);
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

      socket.write(renderHttpError(httpError));
    } finally {
      socket.end();
    }
  }

  // Properties
  get server() {
    return this._server;
  }
}
