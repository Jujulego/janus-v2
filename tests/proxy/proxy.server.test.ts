import { overrideInject$ } from '@jujulego/injector/tests';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { AddressInfo } from 'node:net';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, vi } from 'vitest';

import { RedirectionStore } from '@/src/data/redirection.store.js';
import { redirection$ } from '@/src/data/redirection.js';
import { ProxyServer } from '@/src/proxy/proxy.server.js';

// Setup
let store: RedirectionStore;
let proxy: ProxyServer;

const targetServer = setupServer(
  http.get('http://localhost:3000/life/toto', () => {}),
  http.get('http://localhost:3001/life/toto', () => HttpResponse.json({
    from: 'http://localhost:3001'
  })),
);

beforeAll(() => {
  targetServer.listen({
    onUnhandledRequest(req, print) {
      const url = new URL(req.url);

      // Ignore request to proxy
      const addr = proxy.server.address() as AddressInfo;

      if (url.host === `127.0.0.1:${addr.port}`) {
        return;
      }

      print.warning();
    }
  });
});

beforeEach(() => {
  targetServer.resetHandlers();

  store = overrideInject$(RedirectionStore, new RedirectionStore());
  proxy = overrideInject$(ProxyServer, new ProxyServer());
});

afterAll(() => {
  targetServer.close();
});

// Tests
describe('ProxyServer', () => {
  it('should return 404 if not redirection matched', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(null);

    await request(proxy.server)
      .get('/life/toto')
      .expect(404, { message: 'No redirection found' });
  });

  it('should return 503 if redirection has no output', async () => {
    vi.spyOn(store, 'resolve').mockReturnValue(redirection$({
      id: 'life',
      url: '/life',
      outputs: []
    }));

    await request(proxy.server)
      .get('/life/toto')
      .expect(503, { message: 'No outputs available' });
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

    await request(proxy.server)
      .get('/life/toto')
      .expect(503, { message: 'No outputs available' });
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

    await request(proxy.server)
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

    await request(proxy.server)
      .get('/life/toto')
      .expect(200, { from: 'http://localhost:3001' });

    expect(redirection.disableOutput).toHaveBeenCalledWith('miss');
  });
});
