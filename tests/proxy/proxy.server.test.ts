import { globalScope$, override$ } from '@jujulego/injector';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { Server } from 'node:http';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { RedirectionStore } from '@/src/state/redirection.store.js';
import { redirection$ } from '@/src/state/redirection.ref.js';
import { ProxyServer } from '@/src/proxy/proxy.server.js';
import { createHttpServer, ignoreServer } from '../utils.js';

// Setup
let store: RedirectionStore;
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
  globalScope$().reset();
  targetServer.resetHandlers();

  store = override$(RedirectionStore, new RedirectionStore());
  proxy = override$(ProxyServer, new ProxyServer());

  server = createHttpServer((req, res) => proxy.handleRequest(req, res));
});

afterAll(() => {
  targetServer.close();
});

// Tests
describe('ProxyServer', () => {
  it('should return 404 if not redirection matched', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(null);

    await request(server)
      .get('/life/toto')
      .expect(404, {
        status: 404,
        message: 'No redirection found'
      });
  });

  it('should return 503 if redirection has no output', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: []
    }));

    await request(server)
      .get('/life/toto')
      .expect(503, {
        status: 503,
        message: 'No outputs available'
      });
  });

  it('should return 503 if redirection all outputs are disabled', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'test',
          target: 'http://localhost:3001',
          enabled: false,
          changeOrigin: true,
          secure: true,
          ws: true,
        }
      ]
    }));

    await request(server)
      .get('/life/toto')
      .expect(503, {
        status: 503,
        message: 'No outputs available'
      });
  });

  it('should return data from test output', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'test',
          target: 'http://localhost:3001',
          enabled: true,
          changeOrigin: true,
          secure: true,
          ws: true,
        }
      ]
    }));

    await request(server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });
  });

  it('should return data from test output after disabling miss output', async () => {
    const redirection = redirection$({
      id: 'life',
      url: '/life',
      outputs: [
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
      ]
    });

    vi.spyOn(store, 'resolve').mockReturnValue(redirection);
    vi.spyOn(redirection, 'disableOutput');

    await request(server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });

    expect(redirection.disableOutput).toHaveBeenCalledWith('miss');
  });

  it('should pass body to test output', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: [
        {
          name: 'test',
          target: 'http://localhost:3001',
          enabled: true,
          changeOrigin: true,
          secure: true,
          ws: true,
        }
      ]
    }));

    await request(server)
      .post('/life/echo')
      .send('cool')
      .expect(200, { from: 'http://localhost:3001', body: 'cool' });
  });

  it('should pass body to test output after disabling miss output', async () => {
    const redirection = redirection$({
      id: 'life',
      url: '/life',
      outputs: [
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
      ]
    });

    vi.spyOn(store, 'resolve').mockReturnValue(redirection);
    vi.spyOn(redirection, 'disableOutput');

    await request(server)
      .post('/life/echo')
      .send('cool')
      .expect(200, { from: 'http://localhost:3001', body: 'cool' });

    expect(redirection.disableOutput).toHaveBeenCalledWith('miss');
  });
});
