import { Logger, logger$ } from '@kyrielle/logger';
import createHttpError from 'http-errors';
import { ServerResponse } from 'node:http';
import request from 'supertest';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';

import { version } from '../../package.json' assert { type: 'json' };
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
      .mockImplementation((_, cb) => {
        cb && cb();
        setTimeout(() => server.server.emit('listening'));
        return server.server;
      });

    await server.listen(DEFAULT_CONFIG);

    expect(server.server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});

describe('HttpServer.close', () => {
  it('should call internal server close method', async () => {
    vi.spyOn(server.server, 'close')
      .mockImplementation((cb) => {
        setTimeout(() => cb!());
        return server.server;
      });

    await server.close();

    expect(server.server.close).toHaveBeenCalledOnce();
  });

  it('should throw if an error happened', async () => {
    vi.spyOn(server.server, 'close')
      .mockImplementation((cb) => {
        setTimeout(() => cb!(new Error('This will continue forever!')));
        return server.server;
      });

    await expect(server.close()).rejects.toEqual(new Error('This will continue forever!'));

    expect(server.server.close).toHaveBeenCalledOnce();
  });
});

describe('HttpServer => health endpoint', () => {
  it('should respond with version and pid', async () => {
    await request(server.server)
      .get('/_janus/health')
      .expect(200, {
        pid: process.pid,
        version
      });
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

describe('HttpServer => YogaServer', () => {
  beforeEach(() => {
    Object.assign(server, {
      yoga: {
        handle: vi.fn()
      }
    });
  });

  it('should pass request to yoga', async () => {
    (vi.mocked(server.yoga.handle) as unknown as Mock<[unknown, ServerResponse], void>)
      .mockImplementation(async (req, res) => {
        res.write('cool');
        res.end();
      });

    await request(server.server)
      .get('/_janus')
      .expect(200, 'cool');

    expect(server.yoga.handle).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/_janus' }),
      expect.any(ServerResponse)
    );
  });

  it('should handle errors from yoga', async () => {
    vi.mocked(server.yoga.handle)
      .mockRejectedValue(new Error('Failure'));

    await request(server.server)
      .get('/_janus')
      .expect(500, {
        status: 500,
        message: 'Failure'
      });

    expect(server.yoga.handle).toHaveBeenCalledWith(
      expect.objectContaining({ url: '/_janus' }),
      expect.any(ServerResponse)
    );
  });
});
