import { Logger, logger$ } from '@kyrielle/logger';
import createHttpError from 'http-errors';
import { ServerResponse } from 'node:http';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpServer } from '@/src/server/http.server.js';
import { DEFAULT_CONFIG } from '@/tests/utils.js';
import { serverStore } from '@/src/server/store/server.store.js';

// Setup
let logger: Logger;
let server: HttpServer;

beforeEach(() => {
  logger = logger$();
  server = new HttpServer(logger, serverStore(logger));
});

// Tests
describe('HttpServer.listen', () => {
  it('should call internal server listen method', async () => {
    vi.spyOn(server.server, 'listen')
      .mockImplementation(function (_, cb) {
        cb && cb();
        setTimeout(() => server.server.emit('listening'));
        return server.server;
      });

    await server.listen(DEFAULT_CONFIG);

    expect(server.server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});

describe('HttpServer => ProxyServer', () => {
  it('should pass request to proxy', async () => {
    vi.spyOn(server.proxy, 'handleRequest').mockImplementation(async (req, res) => {
      res.write('cool');
      res.end();
    });

    await request(server.server)
      .get('/test')
      .expect(200, 'cool');

    expect(server.proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });

  it('should handle http errors from proxy', async () => {
    vi.spyOn(server.proxy, 'handleRequest')
      .mockRejectedValue(new createHttpError.NotFound('No redirection found'));

    await request(server.server)
      .get('/test')
      .expect(404, {
        status: 404,
        message: 'No redirection found'
      });

    expect(server.proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });

  it('should handle errors from proxy', async () => {
    vi.spyOn(server.proxy, 'handleRequest')
      .mockRejectedValue(new Error('Failure'));

    await request(server.server)
      .get('/test')
      .expect(500, {
        status: 500,
        message: 'Failure'
      });

    expect(server.proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });
});
