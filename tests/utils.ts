import http, { RequestListener, Server } from 'node:http';
import { AddressInfo } from 'node:net';
import { isHttpError } from 'http-errors';

import { Config } from '@/src/config/type.js';
import { sendHttpError } from '@/src/utils/http-error.js';

// Constants
export const DEFAULT_CONFIG: Config = {
  redirections: {},
  server: {
    port: 3000,
    logfile: '.janus.log',
    pidfile: '.janus.pid',
  },
};

// Utils
export function createHttpServer(listener: RequestListener): Server {
  return http.createServer(async (req, res) => {
    try {
      await listener(req, res);
    } catch (err) {
      if (isHttpError(err)) {
        sendHttpError(res, err);
      } else {
        throw err;
      }
    }
  });
}

export function ignoreServer(req: Request, server: Server): boolean {
  const url = new URL(req.url);
  const addr = server.address() as AddressInfo;

  return url.host === `127.0.0.1:${addr.port}`;
}
