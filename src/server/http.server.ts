import { Logger, withLabel } from '@jujulego/logger';
import createHttpError, { isHttpError } from 'http-errors';
import { createServer, IncomingMessage, ServerResponse } from 'node:http';
import { Duplex } from 'node:stream';

import { version } from '../../package.json' assert { type: 'json' };
import { Config } from '../config/type.ts';
import { YogaServer } from './graphql/yoga.server.ts';
import { ProxyServer } from './proxy/proxy.server.ts';
import { StateHolder } from './state/state-holder.ts';
import { renderHttpError, sendHttpError } from '../utils/http-error.ts';

// Http server
export class HttpServer {
  // Attributes
  private readonly _logger: Logger;
  private readonly _server = createServer((req, res) => this._handleRequest(req, res));

  readonly proxy: ProxyServer;
  readonly yoga: ReturnType<typeof YogaServer>;

  // Constructor
  constructor(logger: Logger, state: StateHolder) {
    this._logger = logger.child(withLabel('http'));

    this.proxy = new ProxyServer(this._logger, state);
    this.yoga = YogaServer(this._logger, state);
  }

  // Methods
  listen(config: Config): Promise<void> {
    this._server.on('upgrade', (req, socket, head) => this._handleUpgrade(req, socket, head));

    this._server.listen(config.server.port, () => {
      this._logger.info`Listening at http://localhost:${config.server.port}`;
    });

    return new Promise((resolve, reject) => {
      this._server.once('listening', resolve);
      this._server.once('error', reject);
    });
  }

  private _handleHealth(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('Content-Type', 'application/json');
    res.write(JSON.stringify({ version }));
    res.end();
  }

  private async _handleRequest(req: IncomingMessage, res: ServerResponse) {
    try {
      if (req.url?.startsWith('/_janus')) {
        if (req.url === '/_janus/health') {
          this._handleHealth(req, res);
        } else {
          // @ts-expect-error Yoga poorly typed
          await this.yoga.handle(req, res);
        }
      } else {
        await this.proxy.handleRequest(req, res);
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
      await this.proxy.handleUpgrade(req, socket, head);
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
