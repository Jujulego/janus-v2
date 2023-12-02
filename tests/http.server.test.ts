import { ActiveScope, override$, scope$ } from '@jujulego/injector';
import createHttpError from 'http-errors';
import { ServerResponse } from 'node:http';
import request from 'supertest';
import { beforeEach } from 'vitest';

import { HttpServer } from '@/src/http.server.ts';
import { ProxyServer } from '@/src/proxy/proxy.server.ts';

// Setup
let scope: ActiveScope;
let proxy: ProxyServer;
let server: HttpServer;

beforeEach(() => {
  scope = scope$('tests');

  proxy = override$(ProxyServer, new ProxyServer());
  server = new HttpServer();
});

afterEach(() => {
  scope.deactivate();
});

// Tests
describe('HttpServer.listen', () => {
  it('should call internal server listen method', () => {
    vi.spyOn(server.server, 'listen').mockReturnThis();

    server.listen(3000);

    expect(server.server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});

describe('HttpServer => ProxyServer', () => {
  it('should pass request to proxy', async () => {
    vi.spyOn(proxy, 'handleRequest').mockImplementation(async (req, res) => {
      res.write('cool');
      res.end();
    });

    await request(server.server)
      .get('/test')
      .expect(200, 'cool');

    expect(proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });

  it('should handle http errors from proxy', async () => {
    vi.spyOn(proxy, 'handleRequest')
      .mockRejectedValue(new createHttpError.NotFound('No redirection found'));

    await request(server.server)
      .get('/test')
      .expect(404, {
        status: 404,
        message: 'No redirection found'
      });

    expect(proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });

  it('should handle errors from proxy', async () => {
    vi.spyOn(proxy, 'handleRequest')
      .mockRejectedValue(new Error('Failure'));

    await request(server.server)
      .get('/test')
      .expect(500, {
        status: 500,
        message: 'Failure'
      });

    expect(proxy.handleRequest).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/test' }),
      expect.any(ServerResponse)
    );
  });
});
