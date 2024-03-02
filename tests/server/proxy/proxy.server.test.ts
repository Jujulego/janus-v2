import { logger$, Logger } from '@kyrielle/logger';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHttpServer, ignoreServer } from '@/tests/utils.ts';
import { ProxyServer } from '@/src/server/proxy/proxy.server.ts';
import { listEnabledOutputs, resolveRedirection } from '@/src/server/store/redirections/selectors.ts';
import { ServerStore } from '@/src/server/store/types.ts';
import { serverStore } from '@/src/server/store/server.store.ts';
import { disableRedirectionOutput } from '@/src/server/store/redirections/actions.js';

// Mocks
vi.mock('@/src/server/store/redirections/selectors.ts');

// Setup
let logger: Logger;
let store: ServerStore;
let proxy: ProxyServer;
let server: Server;

const targetServer = setupServer(
  http.get('http://localhost:3000/life/toto', () => {}),
  http.get('http://localhost:3001/life/toto', () => HttpResponse.json({
    from: 'http://localhost:3001'
  })),
  http.post('http://localhost:3000/life/echo', () => {}),
  http.post('http://localhost:3001/life/echo', async ({ request }) => HttpResponse.json({
    from: 'http://localhost:3001',
    body: await request.text(),
  })),
);

beforeAll(() => {
  targetServer.listen({
    onUnhandledRequest(req, print) {
      if (!ignoreServer(req, server)) {
        print.warning();
      }
    }
  });
});

beforeEach(() => {
  targetServer.resetHandlers();

  logger = logger$();
  store = serverStore(logger);
  proxy = new ProxyServer(logger, store);

  server = createHttpServer((req, res) => proxy.handleRequest(req, res));

  vi.spyOn(store, 'dispatch').mockImplementation((a) => a);
});

afterAll(() => {
  targetServer.close();
});

// Tests
describe('ProxyServer', () => {
  it('should return 404 if not redirection matched', async () => {
    vi.mocked(resolveRedirection).mockReturnValue(null);

    await request(server)
      .get('/life/toto')
      .expect(404, {
        status: 404,
        message: 'No redirection found'
      });
  });

  it('should return 503 if redirection has no output', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {},
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([]);

    await request(server)
      .get('/life/toto')
      .expect(503, {
        status: 503,
        message: 'No outputs available'
      });
  });

  it('should return 503 if redirection all outputs are disabled', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {}
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([]);

    await request(server)
      .get('/life/toto')
      .expect(503, {
        status: 503,
        message: 'No outputs available'
      });
  });

  it('should return data from test output', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {}
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([
      {
        name: 'test',
        target: 'http://localhost:3001',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    ]);

    await request(server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });
  });

  it('should return data from test output after disabling miss output', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {}
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([
      {
        name: 'miss',
        target: 'http://localhost:3000',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      {
        name: 'test',
        target: 'http://localhost:3001',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    ]);

    await request(server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });

    expect(store.dispatch).toHaveBeenCalledWith(disableRedirectionOutput({ redirectionId: 'life', outputName: 'miss' }));
  });

  it('should pass body to test output', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {},
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([
      {
        name: 'test',
        target: 'http://localhost:3001',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    ]);

    await request(server)
      .post('/life/echo')
      .send('cool')
      .expect(200, { from: 'http://localhost:3001', body: 'cool' });
  });

  it('should pass body to test output after disabling miss output', async () => {
    vi.mocked(resolveRedirection).mockReturnValue({
      id: 'life',
      url: '/life',
      outputs: [],
      outputsByName: {}
    });
    vi.mocked(listEnabledOutputs).mockReturnValue([
      {
        name: 'miss',
        target: 'http://localhost:3000',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      },
      {
        name: 'test',
        target: 'http://localhost:3001',
        enabled: true,
        changeOrigin: true,
        secure: true,
        ws: true,
      }
    ]);

    await request(server)
      .post('/life/echo')
      .send('cool')
      .expect(200, { from: 'http://localhost:3001', body: 'cool' });

    expect(store.dispatch).toHaveBeenCalledWith(disableRedirectionOutput({ redirectionId: 'life', outputName: 'miss' }));
  });
});
